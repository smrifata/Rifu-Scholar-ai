import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyDeinDqF_xQ7Vj9s6YoXmtvZJOqlbTVM3o";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
    try {
        console.log("Testing Gemini API with gemini-2.5-flash-lite...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent("Hello, are you working?");
        console.log("Success! Response:", (await result.response).text());
    } catch (error) {
        console.error("Error testing API:");
        console.error(error);
    }
}

run();
