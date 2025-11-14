import schedule from "node-schedule";
import express from "express";
import { generateJobDescription } from "../services/geminiService.js";
import { postToLinkedIn } from "../services/linkedinService.js";

const router = express.Router();

// Generate and schedule a LinkedIn post
router.post("/generate-and-post", async (req, res) => {
  try {
    const { postContent, tone, date, time, linkedinToken, geminiApiKey } =
      req.body;
    console.log(postContent, tone, date, time, linkedinToken, geminiApiKey);

    // 1. Generate content using Gemini AI
    const generatedPost = await generateJobDescription(
      postContent,
      tone,
      geminiApiKey
    );

    if (!generatedPost.success) {
      return res.status(500).json(generatedPost);
    }

    // 2. Schedule the post to LinkedIn
    const dateTime = new Date(`${date}T${time}:00`);
    if (isNaN(dateTime.getTime())) {
      return res.status(400).json({ error: "Invalid date/time" });
    }
    let id;
    schedule.scheduleJob(dateTime, async () => {
      const result = await postToLinkedIn(generatedPost.data, linkedinToken);
      // const result = await postToLinkedIn("HI", linkedinToken);
      console.log("Scheduled job result:", result);
      id = result.postId;
    });

    res.json({
      success: true,
      message: "Post scheduled successfully",
      scheduledTime: dateTime,
      // generatedPost: generatedPost.data,
      // postId: id, // Optionally return the generated post
    });
  } catch (error) {
    console.error("Error in /generate-and-post:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
