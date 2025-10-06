import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GoogleGenAI } from "@google/genai";
console.log(process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Tell me a very funny joke software engineers.",
});
console.log(process.env.GEMINI_API_KEY);
console.log(response.text);
