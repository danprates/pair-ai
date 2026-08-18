import { $ } from "bun";

export const useClaudeCode =
  (model: string) =>
  async (prompt: string): Promise<string> => {
    try {
      const { stdout } =
        await $`claude -p ${prompt} --output-format text --tools "" --permission-mode bypassPermissions --model ${model}`.quiet();
      return stdout.toString().trim();
    } catch (error) {
      const stderr = (error as { stderr?: Buffer }).stderr?.toString().trim();
      throw new Error(stderr || (error as Error).message);
    }
  };
