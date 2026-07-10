"use client";

import { useReducer, useState, useMemo, useCallback, useRef } from "react";

import { fetchProviders, fetchChatCompletions } from "@/lib/api";
import filterAvailableModels from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { Settings2 } from "lucide-react";

import type { Provider, OutputPhase, TextChunk } from "./types";
import {
  INITIAL_PROVIDER_STATE,
  PROVIDER_URLS,
  PROVIDER_ITEMS,
} from "./constants";
import { providerReducer } from "./providerReducer";
import { ApiKeyDialog } from "./components/ApiKeyDialog";
import { OutputSection } from "./components/OutputSection";

export default function HomePage() {
  const [selectedProvider, setSelectedProvider] = useState<Provider | "">("");
  const [providerState, dispatch] = useReducer(
    providerReducer,
    INITIAL_PROVIDER_STATE,
  );

  const [keyInput, setKeyInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  /* Output */
  const [phase, setPhase] = useState<OutputPhase>("idle");
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const chunkIdRef = useRef(0);
  const streamIdRef = useRef(0);

  /* Input ref */
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Derived */
  const current = selectedProvider ? providerState[selectedProvider] : null;

  const providerLabel = useMemo(
    () => PROVIDER_ITEMS.find((i) => i.value === selectedProvider)?.label,
    [selectedProvider],
  );

  const isReady = current && current.apiKey && current.modelVersion;

  /* ── Handlers ────────────────────────────────────────── */

  const resetOutput = useCallback(() => {
    streamIdRef.current += 1;
    setPhase("idle");
    setChunks([]);
  }, []);

  const handleProviderChange = useCallback(
    (value: Provider) => {
      resetOutput();
      setSelectedProvider(value);
    },
    [resetOutput],
  );

  const handleModelChange = useCallback(
    (value: string) => {
      if (!selectedProvider) return;
      resetOutput();
      dispatch({
        type: "SET_CONFIG",
        provider: selectedProvider,
        config: { modelVersion: value },
      });
    },
    [selectedProvider, resetOutput],
  );

  const handleThinkingChange = useCallback(
    (value: string) => {
      if (!selectedProvider) return;
      resetOutput();
      dispatch({
        type: "SET_CONFIG",
        provider: selectedProvider,
        config: { thinking: value },
      });
    },
    [selectedProvider, resetOutput],
  );

  const handleApiKeySave = useCallback(async () => {
    const key = keyInput.trim();
    if (!key || !selectedProvider) return;

    setIsValidating(true);
    setValidationError("");

    try {
      const url = PROVIDER_URLS[selectedProvider];
      const models = await fetchProviders(url, key);
      const { model_list, thinking_mode } = filterAvailableModels(
        selectedProvider,
        models,
      );

      resetOutput();

      dispatch({
        type: "SET_CONFIG",
        provider: selectedProvider,
        config: {
          apiKey: key,
          availableModels: model_list,
          modelVersion: model_list[0] ?? "",
          thinkingModes: thinking_mode,
          thinking: thinking_mode[0] ?? "",
        },
      });

      setDialogOpen(false);
      setKeyInput("");
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Failed to validate API key",
      );
    } finally {
      setIsValidating(false);
    }
  }, [keyInput, selectedProvider, resetOutput]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (isValidating) return;
      setDialogOpen(open);
      if (open) {
        setValidationError("");
        if (current) setKeyInput(current.apiKey);
      }
    },
    [isValidating, current],
  );

  const clearApiKey = useCallback(() => {
    if (!selectedProvider) return;
    resetOutput();
    dispatch({ type: "RESET_PROVIDER", provider: selectedProvider });
    setKeyInput("");
  }, [selectedProvider, resetOutput]);

  /* ── Paraphrase ──────────────────────────────────────── */

  const handleParaphrase = useCallback(async () => {
    if (!isReady || !selectedProvider || !current) return;

    const inputText = inputRef.current?.value?.trim();
    if (!inputText) return;

    const myStreamId = ++streamIdRef.current;

    setPhase("thinking");
    setChunks([]);
    chunkIdRef.current = 0;

    try {
      const messages = [{ role: "user", content: inputText }];

      const generator = fetchChatCompletions(
        current.modelVersion,
        current.apiKey,
        current.thinking,
        messages,
      );

      let firstToken = true;

      for await (const token of generator) {
        if (myStreamId !== streamIdRef.current) return;

        if (firstToken) {
          setPhase("streaming");
          firstToken = false;
        }

        setChunks((prev) => [
          ...prev,
          { id: chunkIdRef.current++, text: token },
        ]);
      }

      if (myStreamId === streamIdRef.current) {
        setPhase("done");
      }
    } catch (err) {
      if (myStreamId === streamIdRef.current) {
        setChunks([
          {
            id: chunkIdRef.current++,
            text:
              err instanceof Error ? err.message : "Gagal memparafrase teks.",
          },
        ]);
        setPhase("done");
      }
    }
  }, [isReady, selectedProvider, current]);

  const handleCopy = useCallback(async () => {
    const text = chunks.map((c) => c.text).join("");
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [chunks]);

  /* ── Render ──────────────────────────────────────────── */

  return (
    <TooltipProvider>
      <main className="relative isolate min-h-screen overflow-hidden bg-background">
        {/* Background blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-1/2 -top-20 size-64 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl sm:-top-44 sm:size-112 lg:-top-48 lg:size-144" />
          <div className="absolute -right-12 top-1/3 size-48 rounded-full bg-secondary/40 blur-3xl sm:-right-24 sm:size-72 lg:size-80" />
        </div>

        <div className="relative z-10 mx-auto mt-3 flex w-full max-w-6xl flex-col gap-4 px-4 pt-2 sm:mt-5 sm:gap-5 sm:pt-4">
          {/* ── Input Section ────────────────────────────── */}
          <section className="flex flex-col items-center gap-3 text-center">
            <h1 className="font-heading text-[1.72rem] leading-tight tracking-tight sm:text-4xl">
              Parafrase teks AI
              <br className="hidden sm:inline" />
              {" "}menjadi lebih natural
            </h1>

            <p className="max-w-3xl text-sm text-muted-foreground">
              Humanizer untuk menghilangkan kesan kaku dan monoton pada teks
              hasil AI.
            </p>

            <Field className="mt-6 w-full max-w-3xl sm:mt-10 lg:w-[60%]">
              <InputGroup>
                <InputGroupTextarea
                  ref={inputRef}
                  placeholder="Tulis kalimat anda disini..."
                  className="min-h-20 max-h-60 resize-none overflow-y-auto
                    [&::-webkit-scrollbar]:w-1.5 px-3
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-input
                    [&::-webkit-scrollbar-button]:hidden
                    [&::-webkit-scrollbar-button]:h-0
                    [&::-webkit-scrollbar-button]:w-0"
                />

                <InputGroupAddon align="block-end">
                  <InputGroupButton
                    variant="default"
                    size="sm"
                    className="ml-auto"
                    disabled={
                      !isReady ||
                      phase === "thinking" ||
                      phase === "streaming"
                    }
                    onClick={handleParaphrase}
                  >
                    {phase === "thinking" || phase === "streaming" ? (
                      <span className="flex items-center gap-1.5">
                        <Spinner className="size-3" />
                        Memproses...
                      </span>
                    ) : (
                      "Parafrase"
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              {/* Bottom bar */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Select
                  value={selectedProvider}
                  onValueChange={(value) =>
                    handleProviderChange(value as Provider)
                  }
                >
                  <SelectTrigger className="w-30">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select provider</SelectLabel>
                      {PROVIDER_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {selectedProvider && (
                  <Button
                    className="group"
                    size="icon"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(true)}
                  >
                    <Settings2 className="size-4 transition-transform duration-300 group-hover:rotate-90" />
                  </Button>
                )}

                {current?.apiKey && current.availableModels.length > 0 && (
                  <>
                    <Select
                      value={current.modelVersion}
                      onValueChange={handleModelChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Select model</SelectLabel>
                          {current.availableModels.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Select
                      value={current.thinking}
                      onValueChange={handleThinkingChange}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Thinking" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Thinking mode</SelectLabel>
                          {current.thinkingModes.map((mode) => (
                            <SelectItem key={mode} value={mode}>
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </>
                )}

                <p className="ml-auto text-xs text-muted-foreground">
                  {!selectedProvider
                    ? "Please select a model"
                    : !current?.apiKey
                      ? "Please configure API key"
                      : null}
                </p>
              </div>
            </Field>
          </section>

          {/* ── Output Section ──────────────────────────── */}
          {phase !== "idle" && (
            <OutputSection
              phase={phase}
              chunks={chunks}
              providerLabel={providerLabel}
              modelVersion={current?.modelVersion ?? ""}
              thinking={current?.thinking ?? ""}
              isCopied={isCopied}
              onCopy={handleCopy}
            />
          )}
        </div>

        {/* ── API Key Dialog ────────────────────────────── */}
        <ApiKeyDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          isValidating={isValidating}
          providerLabel={providerLabel}
          keyInput={keyInput}
          onKeyInputChange={setKeyInput}
          onSave={handleApiKeySave}
          validationError={validationError}
          hasApiKey={!!current?.apiKey}
          onReset={clearApiKey}
        />
      </main>
    </TooltipProvider>
  );
}
