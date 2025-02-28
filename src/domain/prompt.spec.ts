import { describe, expect, it } from "bun:test";
import { Prompt } from "./prompt";

describe("Prompt", () => {
  it("should throw error when file is not found", () => {
    expect(Prompt.from("unknown.xml")).rejects.toThrow();
  });
});
