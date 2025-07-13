import { describe, expect, it, mock } from "bun:test";
import type { DependencyInjection } from "../domain/types";
import { useCommit } from "./commit.action";

describe("CommitAction", () => {
  it("should return error message when there is no diff to commit", () => {
    const git = {
      getDiff: mock<() => Promise<string>>(() => Promise.resolve("")),
      commit: mock<(message: string) => Promise<void>>(() => Promise.resolve()),
      getLogs: mock<(branch: string) => Promise<string>>(() =>
        Promise.resolve("")
      ),
    };
    const console = {
      log: mock<(message: string) => void>(() => {}),
    };
    const ai = {
      ask: mock<(prompt: string) => Promise<string>>(() => Promise.resolve("")),
    };
    const di: DependencyInjection = { git, console, ai };
    const commit = useCommit(di);
    expect(commit()).resolves.toBeUndefined();
    expect(console.log).toHaveBeenCalledWith("There are no changes to commit.");
    expect(git.getDiff).toHaveBeenCalled();
  });
});
