import type { Config } from "../types";
import { useGithub } from "./github";

export const usePullRequestDiff =
  (config: Config) =>
  async (url: string): Promise<string> => {
    switch (config.SOURCE_CONTROL) {
      case "github":
        try {
          return await useGithub()(url);
        } catch (error) {
          throw new Error(
            `${(error as Error).message}\nIf this isn't a GitHub pull request, set SOURCE_CONTROL in your .pair-ai file.`
          );
        }
      default:
        throw new Error(
          `Unknown source control provider: ${config.SOURCE_CONTROL}. Set SOURCE_CONTROL=github in your .pair-ai file.`
        );
    }
  };
