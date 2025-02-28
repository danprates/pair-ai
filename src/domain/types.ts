export interface GetDiff {
  getDiff(): Promise<string>;
}

export interface Log {
  log(message: string): void;
}

export interface Ask {
  ask(prompt: string): Promise<string>;
}
