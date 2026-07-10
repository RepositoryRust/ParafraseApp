import type { Provider, ProviderState } from "./types";

export const INITIAL_PROVIDER_STATE: ProviderState = {
  openai: {
    apiKey: "",
    modelVersion: "",
    thinking: "",
    thinkingModes: [],
    availableModels: [],
  },
  deepseek: {
    apiKey: "",
    modelVersion: "",
    thinking: "",
    thinkingModes: [],
    availableModels: [],
  },
};

export const PROVIDER_URLS: Record<Provider, string> = {
  openai: "https://api.openai.com/v1/models",
  deepseek: "https://api.deepseek.com/models",
};

export const PROVIDER_ITEMS: { label: string; value: Provider }[] = [
  { label: "OpenAI", value: "openai" },
  { label: "Deepseek", value: "deepseek" },
];
