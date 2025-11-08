import schedule from "node-schedule";
import Job from "../models/Job.js";
import express from "express";
import { generateJobDescription } from "../services/geminiService.js";
import { postToLinkedIn } from "../services/linkedinService.js";

const router = express.Router();

// Generate job description using Gemini AI
router.post("/generate", async (req, res) => {
  try {
    const { jobRole } = req.body;

    const result = await generateJobDescription(jobRole);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in /generate:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Post job to LinkedIn
router.post("/post-to-linkedin", async (req, res) => {
  try {
    const { jobs, date, time } = req.body;

    const dateTime = new Date(`${date}T${time}:00`);
    if (isNaN(dateTime.getTime())) {
      return res.status(400).json({ error: "Invalid date/time" });
    }

    try {
      schedule.scheduleJob(dateTime, async () => {
        const result = await postToLinkedIn(jobs);
        console.log("Scheduled job result:", result);
        if (result.success) {
          await Job.updateOne(
            { _id: jobs._id },
            { $set: { postedToLinkedIn: true } }
          );
        }
      });
      console.log("Job scheduled successfully");
    } catch (error) {
      console.error("Error posting to LinkedIn:", error);
    }

    res.json({
      success: true,
      message: "Job scheduled successfully",
      scheduledTime: dateTime,
    });
  } catch (error) {
    console.error("Error in /post-to-linkedin:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;