"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

const MICROSERVICE_URL = process.env.MICROSERVICE_URL as string;

export const generateCaptionedVideo = action({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(internal.projects.getProjectById, {
      id: args.id,
    });
    if (!project) {
      throw new Error("Project not found");
    }
    if (!project.captions || !project.captionSettings) {
      throw new Error("Project does not have captions or caption settings");
    }

    const videoUrl = await ctx.runQuery(internal.projects.getFileUrlById, {
      id: project.videoFileId,
    });
    if (!videoUrl) {
      throw new Error("Video file not found");
    }

    let audio: string | undefined;
    if (project.audioFileId) {
      const audioUrl = await ctx.runQuery(internal.projects.getFileUrlById, {
        id: project.audioFileId,
      });
      if (!audioUrl) {
        throw new Error("Video file not found");
      }
      audio = audioUrl;
    }

    try {
      const response = await fetch(MICROSERVICE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputUrl: videoUrl,
          outputFormat: "mp4",
          captions: project.captions,
          captionSettings: {
            ...project.captionSettings,
            fontSize: project.captionSettings.fontSize * 0.75,
          },
          audioUrl: audio,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate captioned video: ${response.statusText}`
        );
      }

      const videoBuffer = await response.arrayBuffer();

      const storageId = await ctx.storage.store(
        new Blob([videoBuffer], {
          type: "video/mp4",
        })
      );
      await ctx.runMutation(internal.projects.updateProjectById, {
        id: args.id,
        generatedVideoFileId: storageId,
      });

      return await ctx.storage.getUrl(storageId);
    } catch (error) {
      console.log("Error generating captioned video:", error);
    }
  },
});
