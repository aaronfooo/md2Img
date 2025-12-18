
import { GoogleGenAI, Type } from "@google/genai";

export const generateAITitle = async (content: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a very short, catchy title (max 5 words) for the following AI response content. Return ONLY the title text. No quotes. Content: ${content.substring(0, 1000)}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 50,
      }
    });

    return response.text?.trim() || "Untitled Snippet";
  } catch (error) {
    console.error("Gemini Title Generation Failed:", error);
    return "AI Conversation Snippet";
  }
};
