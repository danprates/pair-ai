import { $ } from "bun";
import type { CommitMessage, GetDiff } from "./types";

export class Git implements GetDiff, CommitMessage {
  async getDiff(): Promise<string> {
    const { stdout } = await $`git add . && git diff --cached`.quiet();
    return stdout.toString().trim();
  }
  async commit(message: string): Promise<void> {
    await $`git add . && git commit -m "${message}"`;
  }
}
