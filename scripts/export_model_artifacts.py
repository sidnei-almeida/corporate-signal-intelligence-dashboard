"""Export the trained pipeline and the served panel as JSON the dashboard can read.

The dashboard used to call a Python API for everything. This script moves that work to
build time: the Isolation Forest is flattened into plain arrays that a TypeScript scorer
can walk, and the panel is reduced to the slices the serving layer actually returns.

Run it from the ML repo whenever the pipeline is retrained:

    python scripts/export_model_artifacts.py --source /path/to/corporate-signal-intelligence

Everything it writes lands in src/data/generated/ and is committed, so a Vercel build
never needs Python, the joblib artifact, or the 28 MB results CSV.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

DASHBOARD_ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = DASHBOARD_ROOT / "src" / "data" / "generated"

MODEL_FILE = "models/isolation_forest_anomaly_pipeline.joblib"
RESULTS_FILE = "data/anomaly_detection_results.csv"
TOP_ANOMALIES_FILE = "data/top_anomalies_final.csv"

# Mirrors app/schemas/anomaly_schema.py::SERVED_ANOMALY_COLUMNS. The response contract is
# the reason this list exists; keeping it in the same order keeps diffs readable.
SERVED_COLUMNS = [
    "ticker",
    "date",
    "anomaly_score",
    "is_anomaly",
    "anomaly_type",
    "anomaly_label",
    "structural_score",
    "is_structural_outlier",
    "return_zscore_21d",
    "volume_zscore_21d",
    "range_zscore_21d",
    "log_return",
    "realised_volatility_21d",
    "market_return",
    "idiosyncratic_zscore",
    "filed_8k_2d",
    "filed_10q_2d",
    "filed_10k_2d",
    "in_earnings_window",
    "days_since_8k",
]

# The alert queue is capped at a 10% budget, so rows below the 90th percentile can never
# appear in it. A small margin keeps the boundary rows available for rounding differences.
QUEUE_COVERAGE_QUANTILE = 0.885

# Budget grid the serving layer resolves thresholds from, in percent of issuer-days.
BUDGET_MIN = 0.1
BUDGET_MAX = 10.0
BUDGET_STEP = 0.05

TOP_CACHE_SIZE = 100

# Mirrors app/services/data_service.py::SEVERITY_BUDGETS.
SEVERITY_BUDGETS = (
    ("critical", 0.1),
    ("high", 0.25),
    ("moderate", 0.5),
    ("watch", 1.0),
)

VALIDATION_ARTIFACTS = {
    "detectors": "data/validation_detector_metrics.csv",
    "horizon": "data/validation_horizon_sensitivity.csv",
    "pairwise": "data/validation_pairwise_tests.csv",
    "walk_forward": "data/validation_walk_forward.csv",
    "ensembles": "data/validation_ensembles.csv",
    "training_window": "data/validation_training_window.csv",
    "issuer_year_blocks": "data/validation_issuer_year_blocks.csv",
    "shap_attribution": "data/validation_shap_attribution.csv",
    "alert_drivers": "data/validation_alert_drivers.csv",
    "regime_behaviour": "data/validation_regime_behaviour.csv",
    "alert_concentration": "data/validation_alert_concentration.csv",
    "budget_stability": "data/validation_budget_stability.csv",
    "feature_ablation": "data/validation_feature_ablation.csv",
    "model_jaccard": "data/validation_model_jaccard.csv",
    "model_spearman": "data/validation_model_spearman.csv",
    "monthly_alert_rate": "data/validation_monthly_alert_rate.csv",
    "model_timings": "data/model_timings.csv",
}


# --- helpers --------------------------------------------------------------------


def clean(value: Any) -> Any:
    """Make a pandas/numpy value JSON-safe, mapping every missing marker to None."""
    if value is None:
        return None
    if isinstance(value, (np.bool_, bool)):
        return bool(value)
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        number = float(value)
        if math.isnan(number) or math.isinf(number):
            return None
        # Eight significant digits: far below the precision any threshold comparison or
        # chart needs, and it roughly halves the JSON the browser has to download.
        return float(f"{number:.8g}")
    if isinstance(value, (pd.Timestamp,)):
        return None if pd.isna(value) else value.date().isoformat()
    if value is pd.NaT:
        return None
    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass
    return value


def records(frame: pd.DataFrame) -> list[dict[str, Any]]:
    """Convert a frame to JSON-safe records, mirroring utils.formatting."""
    if frame.empty:
        return []
    return [
        {key: clean(value) for key, value in record.items()}
        for record in frame.to_dict(orient="records")
    ]


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    size_kb = path.stat().st_size / 1024
    print(f"  {path.relative_to(DASHBOARD_ROOT)}  {size_kb:,.0f} KB")


# --- model ----------------------------------------------------------------------


def export_model(source: Path) -> None:
    """Flatten Pipeline(SimpleImputer, RobustScaler, IsolationForest) into arrays.

    Only what scoring needs is kept: the per-column median used for imputation, the
    RobustScaler centre and scale, and each tree's split structure plus the sample count
    at every node (the count is what the path-length correction is computed from).
    """
    pipeline = joblib.load(source / MODEL_FILE)
    imputer = pipeline.named_steps["impute"]
    scaler = pipeline.named_steps["scale"]
    forest = pipeline.named_steps["detector"]

    feature_names = [str(name) for name in pipeline.feature_names_in_]

    # max_features=1.0 means every tree sees every column in order. The TS scorer assumes
    # that, so refuse to export a model where it stopped holding.
    identity = np.arange(len(feature_names))
    if not all(np.array_equal(cols, identity) for cols in forest.estimators_features_):
        raise SystemExit("Trees use feature subsets; the TypeScript scorer cannot read this model.")

    trees = []
    for estimator in forest.estimators_:
        tree = estimator.tree_
        trees.append(
            {
                "feature": tree.feature.astype(int).tolist(),
                "threshold": [round(float(value), 12) for value in tree.threshold],
                "left": tree.children_left.astype(int).tolist(),
                "right": tree.children_right.astype(int).tolist(),
                "count": tree.n_node_samples.astype(int).tolist(),
            }
        )

    write_json(
        OUT_DIR / "isolation-forest.json",
        {
            "featureNames": feature_names,
            "imputerMedians": [float(value) for value in imputer.statistics_],
            "scalerCenter": [float(value) for value in scaler.center_],
            "scalerScale": [float(value) for value in scaler.scale_],
            "maxSamples": int(forest.max_samples_),
            "offset": float(forest.offset_),
            "trees": trees,
        },
    )


def export_parity_fixture(source: Path, sample_size: int = 400) -> None:
    """Freeze scikit-learn's own output on a sample so the TS port can be checked."""
    pipeline = joblib.load(source / MODEL_FILE)
    feature_names = [str(name) for name in pipeline.feature_names_in_]

    frame = pd.read_csv(source / RESULTS_FILE, usecols=feature_names)
    sample = frame.sample(n=min(sample_size, len(frame)), random_state=7).reset_index(drop=True)

    scores = pipeline.score_samples(sample)
    decisions = pipeline.decision_function(sample)
    predictions = pipeline.predict(sample)

    write_json(
        DASHBOARD_ROOT / "scripts" / "fixtures" / "inference-parity.json",
        {
            "featureNames": feature_names,
            # Full precision here on purpose: the fixture exists to catch a drift in the
            # scorer, so rounding the inputs would blunt the very thing it measures.
            "rows": [
                [None if value is None or (isinstance(value, float) and math.isnan(value)) else float(value) for value in row]
                for row in sample[feature_names].to_numpy(dtype=object)
            ],
            "scoreSamples": [float(value) for value in scores],
            "decisionFunction": [float(value) for value in decisions],
            "predictions": [int(value) for value in predictions],
        },
    )


# --- panel ----------------------------------------------------------------------


def build_panel(source: Path) -> pd.DataFrame:
    path = source / RESULTS_FILE
    header = pd.read_csv(path, nrows=0).columns.tolist()
    usecols = [column for column in SERVED_COLUMNS if column in header]
    frame = pd.read_csv(path, usecols=usecols)
    frame["ticker"] = frame["ticker"].astype(str).str.strip().str.upper()
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
    frame["anomaly_score"] = pd.to_numeric(frame["anomaly_score"], errors="coerce")
    frame["is_anomaly"] = frame["is_anomaly"].astype(bool)
    if "is_structural_outlier" in frame.columns:
        frame["is_structural_outlier"] = frame["is_structural_outlier"].astype(bool)
    return frame[usecols]


def export_panel(source: Path) -> None:
    frame = build_panel(source)
    scores = frame["anomaly_score"].dropna()

    # Per-issuer aggregates, one pass, same definitions as data_service.
    companies: list[dict[str, Any]] = []
    summaries: list[dict[str, Any]] = []
    profiles: dict[str, dict[str, Any]] = {}

    for ticker, group in frame.groupby("ticker", sort=True):
        rows = len(group)
        anomaly_rows = group.loc[group["is_anomaly"]]
        anomalies = len(anomaly_rows)
        ordered = group.sort_values("date")
        first_date = clean(ordered["date"].iloc[0])
        last_date = clean(ordered["date"].iloc[-1])
        rate = round(anomalies / rows, 4) if rows else 0.0

        latest_anomaly = None
        latest_alert_date = None
        if anomalies:
            latest = anomaly_rows.sort_values("date").iloc[-1]
            latest_anomaly = records(latest.to_frame().T)[0]
            latest_alert_date = clean(latest["date"])

        group_scores = group["anomaly_score"].dropna()
        summaries.append(
            {
                "ticker": ticker,
                "rows": rows,
                "anomalies": anomalies,
                "anomaly_rate": rate,
                "avg_score": clean(group_scores.mean()) if not group_scores.empty else None,
                "max_score": clean(group_scores.max()) if not group_scores.empty else None,
                "latest_alert_date": latest_alert_date,
            }
        )
        profiles[ticker] = {
            "ticker": ticker,
            "row_count": rows,
            "first_date": first_date,
            "last_date": last_date,
            "anomaly_count": anomalies,
            "anomaly_rate": rate,
            "latest_anomaly": latest_anomaly,
        }
        companies.append(
            {
                "ticker": ticker,
                "row_count": rows,
                "first_date": first_date,
                "last_date": last_date,
                "anomaly_count": anomalies,
                "anomaly_rate": rate,
            }
        )

    # Top anomalies: the curated export when present, the panel's own ranking otherwise.
    top_path = source / TOP_ANOMALIES_FILE
    top_records: list[dict[str, Any]] = []
    if top_path.is_file():
        top_header = pd.read_csv(top_path, nrows=0).columns.tolist()
        top_cols = [column for column in SERVED_COLUMNS if column in top_header]
        if top_cols:
            top_frame = pd.read_csv(top_path, usecols=top_cols)
            top_frame["date"] = pd.to_datetime(top_frame["date"], errors="coerce")
            top_frame["ticker"] = top_frame["ticker"].astype(str).str.strip().str.upper()
            top_frame = top_frame.sort_values("anomaly_score", ascending=False)
            top_records = records(top_frame.head(TOP_CACHE_SIZE))
    if not top_records:
        ranked = frame.loc[frame["is_anomaly"]].sort_values("anomaly_score", ascending=False)
        top_records = records(ranked.head(TOP_CACHE_SIZE))

    type_counts: dict[str, int] = {}
    if "anomaly_type" in frame.columns:
        flagged = frame.loc[frame["is_anomaly"], "anomaly_type"]
        for value in flagged.dropna():
            label = str(value).strip()
            if label and label != "normal":
                type_counts[label] = type_counts.get(label, 0) + 1
    total_typed = sum(type_counts.values())

    # Budget -> threshold, resolved here so the request path never sees the full panel.
    steps = int(round((BUDGET_MAX - BUDGET_MIN) / BUDGET_STEP)) + 1
    budget_grid = [round(BUDGET_MIN + index * BUDGET_STEP, 2) for index in range(steps)]
    thresholds = {
        f"{budget:.2f}": float(scores.quantile(1 - budget / 100.0)) for budget in budget_grid
    }

    bounds = [
        (profile["first_date"], profile["last_date"])
        for profile in profiles.values()
        if profile["first_date"] and profile["last_date"]
    ]
    span_years = None
    if bounds:
        start = pd.to_datetime(min(first for first, _ in bounds))
        end = pd.to_datetime(max(last for _, last in bounds))
        days = (end - start).days
        span_years = days / 365.25 if days > 0 else None

    write_json(
        OUT_DIR / "panel.json",
        {
            "totalRows": int(len(frame)),
            "scoredRows": int(len(scores)),
            "panelSpanYears": span_years,
            "companies": companies,
            "summary": sorted(summaries, key=lambda item: item["ticker"]),
            "profiles": profiles,
            "topAnomalies": top_records,
            "anomalyTypes": [
                {
                    "anomaly_type": key,
                    "count": value,
                    "share_pct": round(100 * value / total_typed, 1) if total_typed else 0.0,
                }
                for key, value in sorted(
                    type_counts.items(), key=lambda item: item[1], reverse=True
                )
            ],
            "budgetThresholds": thresholds,
            "severityThresholds": [
                {"tier": tier, "threshold": float(scores.quantile(1 - budget / 100.0))}
                for tier, budget in SEVERITY_BUDGETS
            ],
        },
    )

    # Every row the queue can reach at the maximum budget, ranked once here so the
    # request path only has to slice.
    cutoff = float(scores.quantile(QUEUE_COVERAGE_QUANTILE))
    queue = frame.loc[frame["anomaly_score"] >= cutoff].sort_values(
        "anomaly_score", ascending=False
    )
    write_json(
        OUT_DIR / "alerts.json",
        {"cutoff": cutoff, "records": records(queue)},
    )

    # The flagged days, kept whole: /anomalies/{ticker} and the briefing lookup read this.
    flagged_rows = frame.loc[frame["is_anomaly"]].sort_values(
        ["ticker", "date"], ascending=[True, True]
    )
    write_json(OUT_DIR / "anomalies.json", {"records": records(flagged_rows)})


# --- validation -----------------------------------------------------------------


def export_validation(source: Path) -> None:
    payload: dict[str, Any] = {"artifacts": {}}

    for name, relative in VALIDATION_ARTIFACTS.items():
        path = source / relative
        if not path.is_file():
            continue
        frame = pd.read_csv(path)
        payload["artifacts"][name] = records(frame)

    summary_path = source / "model" / "validation_summary.json"
    metrics_path = source / "model" / "training_metrics.json"
    payload["summary"] = json.loads(summary_path.read_text()) if summary_path.is_file() else {}
    payload["trainingMetrics"] = (
        json.loads(metrics_path.read_text()) if metrics_path.is_file() else {}
    )

    schema_path = source / "model" / "feature_schema.json"
    payload["featureSchema"] = (
        json.loads(schema_path.read_text()) if schema_path.is_file() else {}
    )

    write_json(OUT_DIR / "validation.json", payload)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=Path("/home/sidnei-almeida/Documents/GitHub/corporate-signal-intelligence"),
        help="Path to the corporate-signal-intelligence repo",
    )
    args = parser.parse_args()
    source = args.source.expanduser().resolve()
    if not (source / MODEL_FILE).is_file():
        raise SystemExit(f"Model artifact not found under {source}")

    print(f"Exporting from {source}")
    export_model(source)
    export_parity_fixture(source)
    export_panel(source)
    export_validation(source)
    print("Done.")


if __name__ == "__main__":
    main()
