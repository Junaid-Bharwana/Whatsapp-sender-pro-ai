
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateWhatsAppMessage = async (prompt: string, tone: 'professional' | 'casual' | 'urgent' = 'professional'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a short, engaging WhatsApp message based on the following context. 
      Tone: ${tone}. 
      Constraint: Keep it under 200 characters if possible. 
      Context: ${prompt}`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text?.trim() || "Failed to generate message content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating message. Please try again.";
  }
};
