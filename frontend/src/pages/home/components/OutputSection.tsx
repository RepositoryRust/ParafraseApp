import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Check } from "lucide-react";

import type { OutputPhase, TextChunk } from "../types";

interface OutputSectionProps {
  phase: OutputPhase;
  chunks: TextChunk[];
  providerLabel: string | undefined;
  modelVersion: string;
  thinking: string;
  isCopied: boolean;
  onCopy: () => void;
}

export function OutputSection({
  phase,
  chunks,
  providerLabel,
  modelVersion,
  thinking,
  isCopied,
  onCopy,
}: OutputSectionProps) {
  const wordCount = useMemo(
    () =>
      chunks
        .map((c) => c.text)
        .join("")
        .split(/\s+/)
        .filter(Boolean).length,
    [chunks],
  );

  const charCount = useMemo(
    () => chunks.reduce((sum, c) => sum + c.text.length, 0),
    [chunks],
  );

  return (
    <section className="mx-auto mb-5 w-full max-w-3xl lg:w-[60%]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                {providerLabel}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-[0.6rem]">
                  {modelVersion}
                </Badge>
                {thinking && thinking !== "none" && (
                  <Badge variant="outline" className="text-[0.6rem]">
                    think: {thinking}
                  </Badge>
                )}
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  disabled={phase !== "done"}
                  onClick={onCopy}
                >
                  {isCopied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {isCopied ? "Tersalin!" : "Salin teks"}
              </TooltipContent>
            </Tooltip>
          </div>
          <Separator />
        </CardHeader>

        <CardContent>
          {phase === "thinking" ? (
            <div className="flex items-center gap-2.5 py-4">
              <span className="animate-[text-shimmer_2s_linear_infinite] bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-sm font-medium text-transparent">
                Thinking ...
              </span>
              <span className="flex gap-1">
                <span className="size-1 animate-[dot-bounce_1.2s_ease-in-out_infinite] rounded-full bg-muted-foreground" />
                <span className="size-1 animate-[dot-bounce_1.2s_ease-in-out_0.15s_infinite] rounded-full bg-muted-foreground" />
                <span className="size-1 animate-[dot-bounce_1.2s_ease-in-out_0.3s_infinite] rounded-full bg-muted-foreground" />
              </span>
            </div>
          ) : (
            <div
              className="min-h-20 max-h-75 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90
              [&::-webkit-scrollbar]:w-1.5 text-justify sm:pr-5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-input
              [&::-webkit-scrollbar-button]:hidden
              [&::-webkit-scrollbar-button]:h-0
              [&::-webkit-scrollbar-button]:w-0"
            >
              {chunks.map((chunk) => (
                <span
                  key={chunk.id}
                  className="opacity-0 animate-[token-fade-in_0.35s_ease-out_forwards]"
                >
                  {chunk.text}
                </span>
              ))}
              {phase === "streaming" && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
              )}
            </div>
          )}
        </CardContent>

        {phase === "done" && (
          <CardFooter>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3 text-[0.7rem] text-muted-foreground sm:text-[0.65rem]">
                <span>{wordCount} kata</span>
                <span>{charCount} karakter</span>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </section>
  );
}
