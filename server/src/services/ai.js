import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export async function summarizeClinicalText(text) {
  // 🧠 Safety check for API key
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("❌ GOOGLE_API_KEY not set in .env file");
  }

  // 🔑 Initialize Gemini
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // ✅ stable + fast

  // ✂️ Limit text length (avoid token overflow)
  const trimmedText = text.length > 6000 ? text.slice(0, 6000) : text;

  // 🧾 Prompt for medical summarization
  const prompt = `
You are a professional medical summarizer.
Summarize the following report in clear, structured bullet points under these headings:
- **Findings**
- **Impression**
- **Key Values / Observations**

Rules:
- Be accurate and faithful to the input.
- Do NOT add or assume any information not present in the text.
- Keep summary under 200 words.

Report:
"""
${trimmedText}
"""
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    console.log("✅ Summary generated successfully");
    return summary.trim();
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    throw new Error("Failed to generate summary");
  }
}
