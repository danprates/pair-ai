import { describe, expect, it, mock } from "bun:test";
import { CommitAction } from "./commit.action";

describe("CommitAction", () => {
  it("should return error message when there is no diff to commit", () => {
    const git = {
      getDiff: mock<() => Promise<string>>(() => Promise.resolve("")),
    };
    const console = {
      log: mock<(message: string) => void>(() => {}),
    };
    const commit = new CommitAction(git, console);
    expect(commit.run()).resolves.toBeUndefined();
    expect(console.log).toHaveBeenCalledWith("There are no changes to commit.");
    expect(git.getDiff).toHaveBeenCalled();
  });
});
