import type { Config } from "./env";

export interface Action {
  run(...args: string[]): Promise<void>;
}

export type UseAction = (
  dependencies: Dependencies,
  config: Config
) => (...args: string[]) => Promise<void>;

export type Ask = (prompt: string) => Promise<string>;
export type Dependencies = {
  readFile: (file: string) => Promise<string>;
  saveFile: (file: string, content: string) => Promise<void>;
  replaceKey: (content: string, key: string, value: string) => string;
  replaceKeys: (content: string, keys: Record<string, string>) => string;
  log: (message: string) => void;
  getDiff: () => Promise<string>;
  commit: (message: string) => Promise<void>;
  getLogs: (branch: string) => Promise<string>;
  ask: Ask;
};

export type UseDependencies = (config: Config) => Dependencies;
