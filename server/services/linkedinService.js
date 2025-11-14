import axios from "axios";
function formatJobForLinkedIn(generatedPost) {
  const { title, intro, mainContent, keyTakeaways = [], callToAction, hashtags = [] } = generatedPost;

  return [
    title,
    intro,
    mainContent,
    keyTakeaways.length ? "Key Takeaways:\n- " + keyTakeaways.join("\n- ") : "",
    callToAction,
    hashtags.length ? hashtags.join(" ") : ""
  ].join("\n\n");
}

export const postToLinkedIn = async (generatedPost, linkedinToken) => {
  // const accessToken = linkedinToken.toString().trim().replace(/(\r\n|\n|\r)/gm, "");
  // const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  // console.log("Access token received:", `"${accessToken}"`);

  // if (!accessToken) {
  //   console.log("Simulating LinkedIn post (no valid access token provided)");
  //   console.log("Job data:", JSON.stringify(generatedPost, null, 2));
  //   return {
  //     success: true,
  //     postId: "simulated_post_id_" + Date.now(),
  //     message: "Job posted successfully to LinkedIn (simulated)",
  //   };
  // }

  let accessToken = linkedinToken
    ?.toString()
    .trim()
    .replace(/(\r\n|\n|\r)/gm, "");

  if (!accessToken) {
    accessToken = process.env.LINKEDIN_ACCESS_TOKEN?.trim();
  }

  console.log("Access token received:", `"${accessToken}"`);

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
    console.log("authorId", authorId);

    const shareData = {
      author: `urn:li:person:${authorId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: formatJobForLinkedIn(generatedPost),
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
    console.log("reached");

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
