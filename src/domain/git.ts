import { $ } from "bun";
import type { GetDiff } from "./types";

export class Git implements GetDiff {
  async getDiff(): Promise<string> {
    const { stdout } = await $`git add . && git diff --cached`.quiet();
    return stdout.toString().trim();
  }
}
