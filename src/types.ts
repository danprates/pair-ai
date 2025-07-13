export interface Action {
  run(...args: string[]): Promise<void>;
}

export type UseAction = (
  dependencies: Dependencies
) => (...args: string[]) => Promise<void>;

export type Dependencies = {
  readFile: (file: string) => Promise<string>;
  saveFile: (file: string, content: string) => Promise<void>;
  replaceKey: (content: string, key: string, value: string) => string;
  log: (message: string) => void;
  getDiff: () => Promise<string>;
  commit: (message: string) => Promise<void>;
  getLogs: (branch: string) => Promise<string>;
  ask: (prompt: string) => Promise<string>;
};

export type UseDependencies = () => Dependencies;
