import { askGemini } from "./artificial-inteligence/gemini";
import type { DependencyInjection } from "./types";
import { commit, getDiff, getLogs, log } from "./utils";

export const dependencies: DependencyInjection = {
  git: {
    getDiff,
    commit,
    getLogs,
  },
  console: { log },
  ai: { ask: askGemini(process.env.GEMINI_API_KEY || "", "gemini-2.0-flash") },
};
