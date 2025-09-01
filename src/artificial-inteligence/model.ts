import type { Ask, Config } from "../types";
import { useGemini } from "./gemini";
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
    default:
      throw new Error(`Unknown model provider: ${provider}`);
  }
};
