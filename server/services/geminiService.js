import { GoogleGenAI } from "@google/genai";

export const generateJobDescription = async (
  postContent,
  tone,
  geminiApiKey
) => {
  // const GEMENI_KEY = geminiApiKey;
  if (!geminiApiKey) {
    const GEMENI_KEY = process.env.GEMINI_API_KEY;
    console.log(GEMENI_KEY);
  }

  const ai = new GoogleGenAI({
    apiKey: GEMENI_KEY,
  });
  const prompt = `You are a professional LinkedIn content creator and technology trend analyst. 
Your task is to generate a comprehensive, engaging, and insight-driven LinkedIn post.

Topic: "${postContent}"
Tone: ${tone}

Step 1: Research the latest (2024–2025) industry trends, insights, and discussions related to this topic.
Focus on emerging tools, frameworks, success stories, and opinions shared by top industry voices.

Step 2: Based on your findings, craft a high-quality LinkedIn post structured as JSON in the following format:

{
  "title": "An attention-grabbing headline or hook suitable for LinkedIn",
  "intro": "A 2–3 sentence introduction that connects with the audience and highlights the topic's relevance.",
  "mainContent": "2–3 paragraphs of valuable insights, latest trends, or thought-leadership points about the topic.",
  "keyTakeaways": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"],
  "callToAction": "A closing line that encourages engagement (e.g., question, opinion, or share request).",
  "hashtags": ["#Technology", "#Innovation", "#YourTopic"]
}

Step 3:
- Ensure the content reflects real, current (2024–2025) technology trends.
- Keep the writing natural, conversational, and professional.
- Include relatable insights or data points if available.
- Tailor the tone (${tone}) to sound authentic for a human LinkedIn creator.
- Return ONLY valid JSON. No markdown, no extra text, no commentary.`;

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
    console.error("Error generating content with Gemini:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
