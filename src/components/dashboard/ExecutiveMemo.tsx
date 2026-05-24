"use client";

import { useState } from "react";
import { Copy, FileText, RefreshCw, Sparkles } from "lucide-react";
import { BriefingMarkdown } from "@/components/dashboard/BriefingMarkdown";
import { MemoInsightSidebar } from "@/components/dashboard/MemoInsightSidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
      title="Executive Memo"
      subtitle="AI-generated briefing from selected anomaly context"
      className="w-full"
    >
      <div className="flex flex-col">
        {showToolbar && hasSelection && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {briefing?.model_used && (
                <Badge className="border-white/10 bg-zinc-900/80 font-mono text-[11px] text-slate-400 normal-case">
                  {briefing.model_used}
                </Badge>
              )}
              {hasBriefing && !loading && (
                <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
                  Generated
                </Badge>
              )}
              {loading && (
                <Badge className="animate-pulse border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                  Generating
                </Badge>
              )}
              {generatedAt && hasBriefing && !loading && (
                <span className="text-xs text-slate-500">
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
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy briefing"}
                </Button>
                <Button
                  variant="ghost"
                  className="text-xs"
                  disabled={loading}
                  onClick={onGenerate}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-rose-950/30 px-4 py-3 text-sm text-rose-300 ring-1 ring-rose-500/20">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 py-10">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
            <p className="animate-pulse text-sm text-slate-400">
              Generating executive briefing…
            </p>
          </div>
        )}

        {!loading && hasBriefing && briefing?.briefing && selectedRecord && (
          <div className="executive-memo-reader max-h-[620px] overflow-y-auto 2xl:max-h-[720px]">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17.5rem]">
              <div className="min-w-0 pr-1">
                <BriefingMarkdown content={briefing.briefing} />
              </div>
              <MemoInsightSidebar record={selectedRecord} />
            </div>
          </div>
        )}

        {!loading && !hasBriefing && !error && (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400/80 ring-1 ring-cyan-500/20">
              {!hasSelection ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            {!hasSelection ? (
              <p className="text-sm text-slate-500">
                Select an anomaly event from the queue to prepare a briefing.
              </p>
            ) : (
              <>
                <p className="text-base font-medium text-slate-200">
                  Ready to generate
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                  Review the selected anomaly context above, then generate an
                  executive memo.
                </p>
              </>
            )}
          </div>
        )}

        <p className="mt-4 border-t border-white/5 pt-3 text-[11px] leading-relaxed text-slate-600">
          {BRIEFING_DISCLAIMER}
        </p>
      </div>
    </Card>
  );
}
