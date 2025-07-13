export interface Action {
  run(...args: string[]): Promise<void>;
}

export interface Git {
  getDiff(): Promise<string>;
  commit(message: string): Promise<void>;
  getLogs(branch: string): Promise<string>;
}

export interface Console {
  log(message: string): void;
}

export interface ArtificialInteligence {
  ask(prompt: string): Promise<string>;
}

export type DependencyInjection = {
  git: Git;
  console: Console;
  ai: ArtificialInteligence;
};

export type UseAction = (
  di: DependencyInjection
) => (...args: string[]) => Promise<void>;
