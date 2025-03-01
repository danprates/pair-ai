import { $ } from "bun";
import type { CommitMessage, GetDiff, GetLogs } from "./types";

export class Git implements GetDiff, CommitMessage, GetLogs {
  async getDiff(): Promise<string> {
    const { stdout } = await $`git add . && git diff --cached`.quiet();
    return stdout.toString().trim();
  }
  async commit(message: string): Promise<void> {
    await $`git add . && git commit -m "${message}"`;
  }

  async getLogs(branch: string): Promise<string> {
    const { stdout } = await $`git log --patch --graph ${branch}..`.quiet();
    return stdout.toString().trim();
  }
}
