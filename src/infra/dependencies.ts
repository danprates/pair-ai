import { Console } from "../domain/console";
import { Git } from "../domain/git";
import { OpenRouter } from "../domain/open-router";
import type { DependencyInjection } from "../domain/types";

export const dependencies: DependencyInjection = {
  git: new Git(),
  console: new Console(),
  ai: new OpenRouter(
    process.env.OPENROUTER_API_KEY || "",
    "google/gemini-2.0-flash-thinking-exp-1219:free"
  ),
};
