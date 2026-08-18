import { $ } from "bun";

export const useClaudeCode =
  (model: string) =>
  async (prompt: string): Promise<string> => {
    const { stdout } =
      await $`claude -p ${prompt} --output-format text --tools "" --permission-mode bypassPermissions --model ${model}`.quiet();
    return stdout.toString().trim();
  };
