import type { Action, ProviderState } from "./types";
import { INITIAL_PROVIDER_STATE } from "./constants";

export function providerReducer(
  state: ProviderState,
  action: Action,
): ProviderState {
  switch (action.type) {
    case "SET_CONFIG":
      return {
        ...state,
        [action.provider]: {
          ...state[action.provider],
          ...action.config,
        },
      };
    case "RESET_PROVIDER":
      return {
        ...state,
        [action.provider]: { ...INITIAL_PROVIDER_STATE[action.provider] },
      };
  }
}
