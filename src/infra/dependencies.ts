import type { DependencyInjection } from "../domain/types";
import { askGemini } from "./artificial-inteligence/gemini";
import { log } from "./console";
import { commit, getDiff, getLogs } from "./git";
export const dependencies: DependencyInjection = {
  git: {
    getDiff,
    commit,
    getLogs,
  },
  console: { log },
  ai: { ask: askGemini(process.env.GEMINI_API_KEY || "", "gemini-2.0-flash") },
};
