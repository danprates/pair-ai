import { $ } from "bun";
import systemPrompt from "../prompts/system.prompt.txt" with { type: "text" };
import type { AskResult } from "../types";
import { NOT_INFORMED_COST, usdToCents } from "./cost";

type ClaudeCodeResponse = {
  result: string;
  total_cost_usd?: number;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
};

export const useClaudeCode =
  (model: string) =>
  async (prompt: string): Promise<AskResult> => {
    try {
      const { stdout } =
        await $`claude -p ${prompt} --output-format json --tools "" --permission-mode bypassPermissions --model ${model} --system-prompt ${systemPrompt}`.quiet();
      const parsed: ClaudeCodeResponse | ClaudeCodeResponse[] = JSON.parse(
        stdout.toString(),
      );
      const data = Array.isArray(parsed) ? parsed[parsed.length - 1] : parsed;
      const usage = data.usage;
      const tokens = usage
        ? (usage.input_tokens ?? 0) +
          (usage.output_tokens ?? 0) +
          (usage.cache_creation_input_tokens ?? 0) +
          (usage.cache_read_input_tokens ?? 0)
        : null;
      const cost =
        data.total_cost_usd !== undefined
          ? usdToCents(data.total_cost_usd)
          : NOT_INFORMED_COST;
      return { content: data.result.trim(), tokens, cost };
    } catch (error) {
      const stderr = (error as { stderr?: Buffer }).stderr?.toString().trim();
      throw new Error(stderr || (error as Error).message);
    }
  };
