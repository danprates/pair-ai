import { describe, expect, it, mock } from "bun:test";
import { useCommit } from "./actions";
import type { Config, UseDependencies } from "./types";

const config: Config = {
  MODEL: "claude/sonnet",
  LANGUAGE: "en",
  COMMIT_LANGUAGE: "en",
  SOURCE_CONTROL: "github",
  PULL_REQUEST_TEMPLATE: "",
};

describe("CommitAction", () => {
  it("should return error message when there is no diff to commit", () => {
    const useDependencies: UseDependencies = () => ({
      readFile: mock<(file: string) => Promise<string>>(() =>
        Promise.resolve(""),
      ),
      saveFile: mock<(file: string, content: string) => Promise<void>>(() =>
        Promise.resolve(),
      ),
      replaceKey: mock<(content: string, key: string, value: string) => string>(
        (content, key, value) => content.replace(`{{ ${key} }}`, value),
      ),
      replaceKeys: mock<(content: string, keys: Record<string, string>) => string>(
        (content) => content,
      ),
      log: mock<(message: string) => void>(() => {}),
      getDiff: mock<() => Promise<string>>(() => Promise.resolve("")),
      commit: mock<(message: string) => Promise<void>>(() => Promise.resolve()),
      getLogs: mock<(branch: string) => Promise<string>>(() =>
        Promise.resolve(""),
      ),
      getRecentCommits: mock<() => Promise<string>>(() => Promise.resolve("")),
      getPullRequestDiff: mock<(url: string) => Promise<string>>(() =>
        Promise.resolve(""),
      ),
      ask: mock<(prompt: string) => Promise<string>>(() => Promise.resolve("")),
    });
    const dependencies = useDependencies(config);
    const commit = useCommit(dependencies, config);
    expect(commit()).resolves.toBeUndefined();
    expect(dependencies.log).toHaveBeenCalledWith(
      "There are no changes to commit.",
    );
    expect(dependencies.getDiff).toHaveBeenCalled();
  });
});
