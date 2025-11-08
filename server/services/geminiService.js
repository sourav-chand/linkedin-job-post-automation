import { GoogleGenAI } from "@google/genai";

export const generateJobDescription = async (jobRole, manner) => {
  const GEMENI_KEY = process.env.GEMINI_API_KEY;
  console.log(GEMENI_KEY);

  if (!GEMENI_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const ai = new GoogleGenAI({
    apiKey: GEMENI_KEY,
  });
  const prompt = `You are a professional HR recruiter. Generate a comprehensive job posting for the role: "${jobRole} in an ${manner}".

Please search and provide the latest industry requirements and trends for this role. Structure your response as a JSON object with the following fields:
{
  "title": "Job title",
  "description": "A compelling 2-3 paragraph job description",
  "requirements": ["requirement 1", "requirement 2", ...],
  "responsibilities": ["responsibility 1", "responsibility 2", ...],
  "skills": ["skill 1", "skill 2", ...],
  "experience": "Years of experience required",
  "education": "Education requirements"
}

Return ONLY valid JSON. No extra words, no markdown, no explanation.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = result.text;
    console.log("result type", typeof result);

    if (!text) throw new Error("No text returned");

    console.log("RAW OUTPUT:", typeof text, text);

    // ✅ Remove markdown wrapper: ```json ... ```
    let jsonText = text.trim();

    if (jsonText.startsWith("```json")) {
      jsonText = jsonText
        .replace(/```json/i, "")
        .replace(/```/g, "")
        .trim();
    }

    // ✅ Parse JSON safely
    let finalJson;
    try {
      finalJson = JSON.parse(jsonText);
    } catch (err) {
      console.error("JSON PARSE FAILED. RAW:\n", jsonText);
      throw new Error("Model returned invalid JSON");
    }
    console.log("PARSED OUTPUT:", finalJson);

    return {
      success: true,
      data: finalJson,
    };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
};
