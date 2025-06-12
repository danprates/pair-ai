import type { DependencyInjection } from "../domain/types";
import { Console } from "./console";
import { Git } from "./git";
import { Ollama } from "./ollama";

export const dependencies: DependencyInjection = {
  git: new Git(),
  console: new Console(),
  ai: new Ollama("llama3.1:8b"),
};
