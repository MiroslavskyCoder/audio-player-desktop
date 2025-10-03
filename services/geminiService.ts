
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getTrackVibe = async (title: string, artist: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "AI features disabled. Please configure your API Key.";
  }
  try {
    const prompt = `Describe the vibe of the song "${title}" by ${artist} in a single, short, poetic sentence. Focus on the mood and feeling.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating track vibe:", error);
    return "Could not generate vibe for this track.";
  }
};
