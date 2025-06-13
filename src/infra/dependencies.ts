import type { DependencyInjection } from "../domain/types";
import { Console } from "./console";
import { Gemini } from "./gemini";
import { Git } from "./git";

export const dependencies: DependencyInjection = {
  git: new Git(),
  console: new Console(),
  ai: new Gemini(process.env.GEMINI_API_KEY || "", "gemini-2.0-flash"),
};
