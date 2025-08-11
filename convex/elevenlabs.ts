"use node";

import { v } from "convex/values";
import { ElevenLabsClient } from "elevenlabs";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export const processVideo = action({
  args: {
    videoId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.storage.getUrl(args.videoId);
    if (!file) {
      throw new Error("File not found in storage");
    }

    const response = await fetch(file);
    const videoBlob = new Blob([await response.arrayBuffer()], {
      type: "video/mp4",
    });

    const result = await client.speechToText.convert({
      file: videoBlob,
      model_id: "scribe_v1",
      language_code: "eng",
    });
    if (!result || !result.words) {
      throw new Error("Failed to process video or no words found");
    }

    const transformedWords = result.words
      .filter((word) => word.type === "word")
      .map((word) => ({
        text: word.text,
        start: word.start ?? 0,
        end: word.end ?? (word.start ?? 0) + 0.1,
        type: word.type as "word" | "spacing",
        speaker_id: word.speaker_id || "speaker_1",
      }));

    return {
      words: transformedWords,
      language_code: result.language_code,
    };
  },
});

export const generateSpeech = action({
  args: {
    projectId: v.id("projects"),
    voiceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(internal.projects.getProjectById, {
      id: args.projectId,
    });
    if (!project || !project.script) {
      throw new Error("Project not found");
    }

    const voiceId = args.voiceId || "EXAVITQu4vr4xnSDxMaL";
    const audioResponse = await client.textToSpeech.convert(voiceId, {
      text: project.script,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
      },
      output_format: "mp3_44100_128",
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audioResponse) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);
    const audioBlob = new Blob([audioBuffer], {
      type: "audio/mp3",
    });

    const audioFileId = await ctx.storage.store(audioBlob);

    const sttResult = await client.speechToText.convert({
      file: audioBlob,
      model_id: "scribe_v1",
      language_code: "eng",
    });
    const transformedWords = sttResult.words
      .filter((word) => word.type === "word")
      .map((word) => ({
        text: word.text,
        start: word.start ?? 0,
        end: word.end ?? (word.start ?? 0) + 0.1,
        type: word.type as "word" | "spacing",
        speaker_id: word.speaker_id || "speaker_1",
      }));

    await ctx.runMutation(internal.projects.updateProjectById, {
      id: args.projectId,
      audioFileId,
      words: transformedWords,
      language_code: sttResult.language_code,
    });

    return await ctx.storage.getUrl(audioFileId);
  },
});

export const getVoices = action({
  handler: async () => {
    try {
      const voices = await client.voices.search({
        category: "premade",
      });
      return voices.voices.map((voice) => ({
        id: voice.voice_id,
        name: voice.name,
        previewUrl: voice.preview_url,
        description: voice.description || "",
        category: voice.category || "other",
      }));
    } catch (error) {
      console.log("Error fetching voices:", error);
      throw error;
    }
  },
});
