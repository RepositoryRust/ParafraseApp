export type Provider = "openai" | "deepseek";

export type OutputPhase = "idle" | "thinking" | "streaming" | "done";

export interface ProviderConfig {
  apiKey: string;
  modelVersion: string;
  thinking: string;
  thinkingModes: string[];
  availableModels: string[];
}

export type ProviderState = Record<Provider, ProviderConfig>;

export interface TextChunk {
  id: number;
  text: string;
}

export type Action =
  | { type: "SET_CONFIG"; provider: Provider; config: Partial<ProviderConfig> }
  | { type: "RESET_PROVIDER"; provider: Provider };
