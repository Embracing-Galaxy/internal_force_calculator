import type { ICalculatorService } from "./interface.ts";
import TauriCalculatorService from "./tauri.ts";
import WebCalculatorService from "./wasm.ts";

interface TauriWindow extends Window {
  __TAURI_INTERNALS__?: unknown;
}

function hasTauriInternals(win: Window): win is TauriWindow {
  return "__TAURI_INTERNALS__" in win;
}

export const isTauri =
  hasTauriInternals(window) && !!(window as TauriWindow).__TAURI_INTERNALS__;

export const calculatorService: ICalculatorService = isTauri
  ? new TauriCalculatorService()
  : new WebCalculatorService();
export * from "./interface.ts";
