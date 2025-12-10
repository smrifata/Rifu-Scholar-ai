import { GoogleGenerativeAI } from "@google/generative-ai";

// We will use a key from localStorage if available, or ask the user for one
export const getStoredApiKey = () => localStorage.getItem("gemini_api_key");
export const setStoredApiKey = (key: string) => localStorage.setItem("gemini_api_key", key);

export async function generateAIResponse(apiKey: string, prompt: string, subject: string, imageBase64?: string) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Contextualize the prompt for an HSC student
    const systemPrompt = `You are Rifu Ai, a helpful and friendly AI tutor for Bangladeshi HSC students. 
    The current subject is: ${subject}.
    Reply in Bengali (or English if requested), but keep the tone encouraging and educational.
    Explain concepts simply. Use formatting (bullet points, bold text) where helpful.
    If the question is about math/science, show the steps clearly.
    
    User Question: ${prompt}`;

    let result;
    if (imageBase64) {
      const imagePart = {
        inlineData: {
          data: imageBase64.split(",")[1], // Remove data:image/jpeg;base64, prefix
          mimeType: "image/jpeg", // Assuming JPEG/PNG, Gemini handles common types
        },
      };
      result = await model.generateContent([systemPrompt, imagePart]);
    } else {
      result = await model.generateContent(systemPrompt);
    }

    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    // Return the error message to display in the UI
    throw new Error(error.message || "Failed to generate response");
  }
}