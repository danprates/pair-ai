import { $ } from "bun";

export const useGithub =
  () =>
  async (url: string): Promise<string> => {
    try {
      const { stdout } = await $`gh pr diff ${url} --patch`.quiet();
      return stdout.toString().trim();
    } catch (error) {
      const stderr = (error as { stderr?: Buffer }).stderr?.toString().trim();
      throw new Error(stderr || (error as Error).message);
    }
  };
