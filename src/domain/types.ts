export interface Action {
  run(...args: string[]): Promise<void>;
}
export interface GetDiff {
  getDiff(): Promise<string>;
}

export interface CommitMessage {
  commit(message: string): Promise<void>;
}

export interface GetLogs {
  getLogs(branch: string): Promise<string>;
}

export interface Log {
  log(message: string): void;
}

export interface Ask {
  ask(prompt: string): Promise<string>;
}
