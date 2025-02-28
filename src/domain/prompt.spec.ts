import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { rm, writeFile } from "fs/promises";
import { Prompt } from "./prompt";

describe("Prompt", () => {
  beforeEach(async () => {
    await writeFile(
      "test.xml",
      "<prompt><name>Hello {{  name}}!</name></prompt>"
    );
  });
  afterAll(async () => {
    await rm("test.xml");
  });
  describe("from", () => {
    it("should throw error when file is not found", () => {
      expect(Prompt.from("unknown.xml")).rejects.toThrow();
    });

    it("should return a prompt object", async () => {
      const prompt = await Prompt.from("test.xml");
      expect(prompt.content).toBe(
        "<prompt><name>Hello {{  name}}!</name></prompt>"
      );
    });
  });

  describe("replace", () => {
    it("should replace the key with the value", async () => {
      const prompt = await Prompt.from("test.xml");
      prompt.replace("name", "world");
      expect(prompt.content).toBe("<prompt><name>Hello world!</name></prompt>");
    });

    it("should not replace the key if it is not found", async () => {
      const prompt = await Prompt.from("test.xml");
      prompt.replace("unknown", "world");
      expect(prompt.content).toBe(
        "<prompt><name>Hello {{  name}}!</name></prompt>"
      );
    });
  });
});
