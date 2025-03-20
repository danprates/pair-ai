import type { DependencyInjection } from "../domain/types";
import { Console } from "./console";
import { Git } from "./git";
import { OpenRouter } from "./open-router";

export const dependencies: DependencyInjection = {
  git: new Git(),
  console: new Console(),
  ai: new OpenRouter(
    process.env.OPENROUTER_API_KEY || "",
    "google/gemini-2.0-flash-thinking-exp-1219:free"
  ),
};
