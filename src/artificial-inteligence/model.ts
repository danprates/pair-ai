import type { Ask, Config } from "../types";
import { useClaudeCode } from "./claude-code";
import { useGemini } from "./gemini";
import { useLlamaServer } from "./llamaserver";
import { useOllama } from "./ollama";
import { useOpenRouter } from "./open-router";
import { useOpenAI } from "./openai";

export const useModel = (config: Config): Ask => {
  const [provider, model] = config.MODEL.split("/");

  switch (provider) {
    case "gemini":
      return useGemini(process.env.GEMINI_API_KEY || "", model);
    case "openai":
      return useOpenAI(process.env.OPENAI_API_KEY || "", model);
    case "openrouter":
      return useOpenRouter(process.env.OPENROUTER_API_KEY || "", model);
    case "ollama":
      return useOllama(model);
    case "llamaserver":
      return useLlamaServer(model);
    case "claude":
      return useClaudeCode(model);
    default:
      throw new Error(`Unknown model provider: ${provider}`);
  }
};
