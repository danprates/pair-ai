export interface GetDiff {
  getDiff(): Promise<string>;
}

export interface Log {
  log(message: string): void;
}
