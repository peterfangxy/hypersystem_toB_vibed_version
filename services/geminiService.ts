import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Placeholder for future AI features (e.g. Tournament Bracket generation, Win probability analysis)
export const isAiAvailable = (): boolean => {
  return !!process.env.API_KEY;
};
