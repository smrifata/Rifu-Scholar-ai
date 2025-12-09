import { GoogleGenerativeAI } from "@google/generative-ai";

// We will use a key from localStorage if available, or ask the user for one
export const getStoredApiKey = () => localStorage.getItem("gemini_api_key");
export const setStoredApiKey = (key: string) => localStorage.setItem("gemini_api_key", key);

export async function generateAIResponse(apiKey: string, prompt: string, subject: string) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Contextualize the prompt for an HSC student
    const systemPrompt = `You are Rifu Ai, a helpful and friendly AI tutor for Bangladeshi HSC students. 
    The current subject is: ${subject}.
    Reply in Bengali (or English if requested), but keep the tone encouraging and educational.
    Explain concepts simply. Use formatting (bullet points, bold text) where helpful.
    If the question is about math/science, show the steps clearly.
    
    User Question: ${prompt}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}