import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the hardcoded key from chat.tsx
const apiKey = "AIzaSyDeinDqF_xQ7Vj9s6YoXmtvZJOqlbTVM3o";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Note: getGenerativeModel doesn't have listModels, the client does, or we access via API.
        // The node SDK exposes no direct listModels on the instance? 
        // Actually it might not. I need to check documentation or use REST.
        // I will use REST for certainty.

        console.log("Listing models via REST...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => {
                console.log(`- ${m.name}`);
                console.log(`  Description: ${m.description}`);
                console.log(`  Supported Methods: ${m.supportedGenerationMethods}`);
            });
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

run();
