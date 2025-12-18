
import { GoogleGenAI } from "@google/genai";

export const generateAITitle = async (content: string): Promise<string> => {
  if (!content || content.trim().length < 5) return "AI Snippet";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // 简化请求结构以避免可能的代理/解析错误
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a creative editor. Read the text below and create a very short, engaging, and professional title (3-5 words).
      
      RULES:
      1. MUST use the same language as the text (e.g. if Chinese text, output Chinese title).
      2. No punctuation at the end.
      3. No "Title:", "Headline:" or quotes.
      
      TEXT START:
      ${content.substring(0, 1500)}
      TEXT END.`,
    });

    const title = response.text?.trim()
      .replace(/["'「」“”]/g, "")
      .replace(/^Title:\s*/i, "")
      .replace(/^标题：\s*/i, "");

    return title || "AI Snippet";
  } catch (error) {
    console.error("Gemini Naming Error:", error);
    // Fallback: 如果 API 失败，抓取前 20 个字符作为标题
    const cleanContent = content.trim().replace(/[#*`]/g, '');
    const fallback = cleanContent.split('\n')[0].substring(0, 15);
    return fallback ? fallback + "..." : "AI Snippet";
  }
};
