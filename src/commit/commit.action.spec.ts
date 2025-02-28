import { describe, expect, it, mock } from "bun:test";
import { CommitAction } from "./commit.action";

describe("CommitAction", () => {
  it("should return error message when there is no diff to commit", () => {
    const getDiff = mock<() => string>(() => "");
    const output = mock<(message: string) => void>(() => {});
    const commit = new CommitAction(getDiff, output);
    expect(commit.run()).resolves.toBeUndefined();
    expect(output).toHaveBeenCalledWith("There are no changes to commit.");
    expect(getDiff).toHaveBeenCalled();
  });
});
