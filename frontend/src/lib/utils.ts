import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const OPENAI_MODELS = new Set([
  "gpt-5.5",
  "gpt-5.4",
  "gpt-5.4-mini",
  "gpt-5.4-nano",
]);

const THINKING_MODES = {
  openai: ["none", "high", "xhigh"],
  deepseek: ["none", "high", "max"],
};

export default function filterAvailableModels(
  provider: "openai" | "deepseek",
  models: string[],
) {
  return {
    model_list:
      provider === "openai"
        ? models.filter((id) => OPENAI_MODELS.has(id))
        : models,

    thinking_mode: THINKING_MODES[provider],
  };
}
