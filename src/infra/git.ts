import { $ } from "bun";

export const getDiff = async (): Promise<string> => {
  const { stdout } =
    await $`git add . && git diff --cached --diff-filter=ACMR`.quiet();
  return stdout.toString().trim();
};

export const commit = async (message: string): Promise<void> => {
  const sanitizedMessage = message.replaceAll("```", "").trim();
  await $`git add . && git commit -m "${sanitizedMessage}"`;
};

export const getLogs = async (branch: string): Promise<string> => {
  const { stdout } =
    await $`git log --patch --graph ${branch}.. --diff-filter=ACMR`.quiet();
  return stdout.toString().trim();
};
