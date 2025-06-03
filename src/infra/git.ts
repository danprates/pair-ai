import { $ } from "bun";
import type { Git as GitInterface } from "../domain/types";

export class Git implements GitInterface {
  async getDiff(): Promise<string> {
    const { stdout } =
      await $`git add . && git diff --cached --diff-filter=ACMR`.quiet();
    return stdout.toString().trim();
  }
  async commit(message: string): Promise<void> {
    await $`git add . && git commit -m "${message}"`;
  }

  async getLogs(branch: string): Promise<string> {
    const { stdout } =
      await $`git log --patch --graph ${branch}.. --diff-filter=ACMR`.quiet();
    return stdout.toString().trim();
  }
}
