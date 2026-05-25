"use client";

import { useState } from "react";
import { IconBriefings, IconCopy, IconRefresh, IconSparkline } from "@/components/icons";
import { BriefingMarkdown } from "@/components/dashboard/BriefingMarkdown";
import { MemoInsightSidebar } from "@/components/dashboard/MemoInsightSidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { CARD_DIVIDER, METRIC_CELL } from "@/lib/cardVisuals";
import { BRIEFING_DISCLAIMER } from "@/lib/constants";
import type { AnomalyRecord, BriefingResponse } from "@/lib/types";

interface ExecutiveMemoProps {
  selectedRecord: AnomalyRecord | null;
  briefing: BriefingResponse | null;
  loading: boolean;
  error: string | null;
  generatedAt: Date | null;
  onGenerate: () => void;
}

function formatGeneratedTimestamp(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function ExecutiveMemo({
  selectedRecord,
  briefing,
  loading,
  error,
  generatedAt,
  onGenerate,
}: ExecutiveMemoProps) {
  const [copied, setCopied] = useState(false);
  const hasSelection = Boolean(selectedRecord?.ticker && selectedRecord?.date);
  const hasBriefing = Boolean(briefing?.briefing);

  const handleCopy = async () => {
    if (!briefing?.briefing) return;
    try {
      await navigator.clipboard.writeText(briefing.briefing);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const showToolbar = hasBriefing || loading;

  return (
    <Card
      title="AI Executive Memo"
      subtitle="AI-generated narrative from selected anomaly context"
      className="w-full"
    >
      <div className="flex flex-col">
        {showToolbar && hasSelection && (
          <div className={`mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${CARD_DIVIDER}`}>
            <div className="flex flex-wrap items-center gap-3">
              {briefing?.model_used && (
                <span className="font-data text-[11px] text-[var(--text-muted)]">
                  {briefing.model_used}
                </span>
              )}
              {hasBriefing && !loading && (
                <StatusIndicator ok label="AI briefing ready" />
              )}
              {loading && (
                <span className="text-xs text-[var(--text-muted)]">Generating…</span>
              )}
              {generatedAt && hasBriefing && !loading && (
                <span className="text-xs text-[var(--text-muted)]">
                  {formatGeneratedTimestamp(generatedAt)}
                </span>
              )}
            </div>
            {hasBriefing && !loading && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="text-xs"
                  onClick={() => void handleCopy()}
                >
                  <IconCopy size={14} />
                  {copied ? "Copied" : "Copy AI briefing"}
                </Button>
                <Button
                  variant="ghost"
                  className="text-xs"
                  disabled={loading}
                  onClick={onGenerate}
                >
                  <IconRefresh size={14} />
                  Regenerate
                </Button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-[var(--critical-border)] bg-[var(--critical-bg)] px-4 py-3 text-sm text-[var(--critical-text)]">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 py-10">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent)]" />
            <p className="text-sm text-[var(--text-muted)]">
              Generating AI briefing…
            </p>
          </div>
        )}

        {!loading && hasBriefing && briefing?.briefing && selectedRecord && (
          <div className={`executive-memo-reader max-h-[620px] overflow-y-auto p-5 2xl:max-h-[720px] 2xl:p-6 ${METRIC_CELL}`}>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17.5rem]">
              <div className="min-w-0 pr-1">
                <BriefingMarkdown content={briefing.briefing} />
              </div>
              <MemoInsightSidebar record={selectedRecord} />
            </div>
          </div>
        )}

        {!loading && !hasBriefing && !error && (
          <div className="empty-state px-4 py-12">
            <div className="empty-state-icon">
              {!hasSelection ? (
                <IconBriefings size={20} />
              ) : (
                <IconSparkline size={20} />
              )}
            </div>
            {!hasSelection ? (
              <p className="empty-state-hint">
                Select an anomaly event to prepare an AI briefing.
              </p>
            ) : (
              <>
                <p className="text-base font-medium text-[var(--text-primary)]">
                  Ready to generate AI briefing
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
                  Review the selected anomaly context, then generate an AI
                  executive memo.
                </p>
              </>
            )}
          </div>
        )}

        <p className={`mt-4 border-t pt-3 text-[11px] leading-relaxed text-[var(--text-muted)] ${CARD_DIVIDER}`}>
          {BRIEFING_DISCLAIMER}
        </p>
      </div>
    </Card>
  );
}
