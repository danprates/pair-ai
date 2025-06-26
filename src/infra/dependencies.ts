import type { DependencyInjection } from "../domain/types";
import { OpenRouter } from "./artificial-inteligence/open-router";
import { Console } from "./console";
import { Git } from "./git";

export const dependencies: DependencyInjection = {
  git: new Git(),
  console: new Console(),
  ai: new OpenRouter(
    process.env.OPENROUTER_API_KEY || "",
    "meta-llama/llama-4-maverick:free"
  ),
};
