export interface Action {
  run(...args: string[]): Promise<void>;
}

export type UseAction = (
  dependencies: Dependencies,
  config: Config
) => (...args: string[]) => Promise<void>;

export type Ask = (prompt: string) => Promise<string>;

export type Config = {
  MODEL: string;
  LANGUAGE: string;
  COMMIT_LANGUAGE: string;
  SOURCE_CONTROL: string;
  PULL_REQUEST_TEMPLATE: string;
};

export type Dependencies = {
  readFile: (file: string) => Promise<string>;
  saveFile: (file: string, content: string) => Promise<void>;
  replaceKey: (content: string, key: string, value: string) => string;
  replaceKeys: (content: string, keys: Record<string, string>) => string;
  log: (message: string) => void;
  getDiff: () => Promise<string>;
  commit: (message: string) => Promise<void>;
  getLogs: (branch: string) => Promise<string>;
  getRecentCommits: () => Promise<string>;
  getPullRequestDiff: (url: string) => Promise<string>;
  ask: Ask;
};

export type UseDependencies = (config: Config) => Dependencies;
