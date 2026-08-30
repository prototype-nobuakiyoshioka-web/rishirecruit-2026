import { gql } from "graphql-request";
import { wpClient } from "../client";
import type { VoiceVideo } from "../types";

const GET_VOICE_VIDEOS = gql`
  query GetVoiceVideos {
    voiceVideos(first: 50, where: { status: PUBLISH }) {
      nodes {
        id
        slug
        title
      }
    }
  }
`;

export async function getVoiceVideos(): Promise<VoiceVideo[]> {
  try {
    const data = await wpClient.request<{ voiceVideos: { nodes: VoiceVideo[] } }>(
      GET_VOICE_VIDEOS,
    );

    return data.voiceVideos.nodes;
  } catch (error) {
    console.error("Failed to fetch voice videos:", error);
    return [];
  }
}
