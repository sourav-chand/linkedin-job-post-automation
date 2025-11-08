import axios from "axios";
function formatJobForLinkedIn(jobData) {
  const { title, company, location, description, skills } = jobData;

  return `
📢 *New Job Opportunity!*

**Role:** ${title || "Not specified"}
**Company:** ${company || "Confidential"}
**Location:** ${location || "Remote / Flexible"}

📝 **Job Description:**
${description || "No description provided."}

💡 **Skills Required:**
${Array.isArray(skills) ? skills.join(", ") : skills || "Not specified"}

Apply now or share this opportunity with your network! 🚀
`;
}

export const postToLinkedIn = async (jobData) => {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!accessToken) {
    console.log("Simulating LinkedIn post (no valid access token provided)");
    console.log("Job data:", JSON.stringify(jobData, null, 2));
    return {
      success: true,
      postId: "simulated_post_id_" + Date.now(),
      message: "Job posted successfully to LinkedIn (simulated)",
    };
  }

  try {
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const authorId = profileResponse.data.sub;

    const shareData = {
      author: `urn:li:person:${authorId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: formatJobForLinkedIn(jobData),
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      shareData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    return {
      success: true,
      postId: response.data.id,
      message: "Job posted successfully to LinkedIn",
    };
  } catch (error) {
    console.error(
      "Error posting to LinkedIn:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};