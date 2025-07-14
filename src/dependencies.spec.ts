import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { rm, writeFile } from "fs/promises";
import { useDependencies } from "./dependencies";

describe("File functions", () => {
  const { readFile, replaceKey } = useDependencies();

  beforeEach(async () => {
    await writeFile(
      "test.xml",
      "<prompt><name>Hello {{  name}}!</name></prompt>"
    );
  });

  afterAll(async () => {
    await rm("test.xml");
  });

  describe("readFile", () => {
    it("should throw error when file is not found", () => {
      expect(readFile("unknown.xml")).rejects.toThrow();
    });

    it("should return a prompt object", async () => {
      const prompt = await readFile("test.xml");
      expect(prompt).toBe("<prompt><name>Hello {{  name}}!</name></prompt>");
    });
  });

  describe("replaceKey", () => {
    it("should replace the key with the value", async () => {
      const file = await readFile("test.xml");
      const prompt = replaceKey(file, "name", "world");
      expect(prompt).toBe("<prompt><name>Hello world!</name></prompt>");
    });

    it("should not replace the key if it is not found", async () => {
      const file = await readFile("test.xml");
      const prompt = replaceKey(file, "unknown", "world");
      expect(prompt).toBe("<prompt><name>Hello {{  name}}!</name></prompt>");
    });
  });
});
