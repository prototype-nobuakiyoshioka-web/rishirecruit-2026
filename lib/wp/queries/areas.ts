import { gql } from "graphql-request";
import { wpClient } from "../client";
import type { JobPosting, Touristspot, WPEvent } from "../types";

const GET_AREAS = gql`
  query GetAreas {
    areas {
      nodes {
        id
        name
        slug
        count
      }
    }
  }
`;

export interface Area {
  id: string;
  name: string;
  slug: string;
  count: number | null;
}

export async function getAreas(): Promise<Area[]> {
  try {
    const data = await wpClient.request<{ areas: { nodes: Area[] } }>(GET_AREAS);

    return data.areas.nodes;
  } catch (error) {
    console.error("Failed to fetch areas:", error);
    return [];
  }
}

const GET_AREA_WITH_POSTS = gql`
  query GetAreaWithPosts($slug: ID!) {
    area(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      jobPostings(first: 20) {
        nodes {
          id
          slug
          title
          jobPostingFields {
            catchCopy
            salary
            employmentType
            thumbnailImage {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
      }
      touristspots(first: 20) {
        nodes {
          id
          slug
          title
          touristspotFields {
            catchCopy
            category
            thumbnailImage {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
      }
      events(first: 20) {
        nodes {
          id
          slug
          title
          eventFields {
            catchCopy
            startDatetime
            endDatetime
            dateDisplayType
            periodMonth
            periodRange
            venueName
            thumbnailImage {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export interface AreaWithPosts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  jobPostings: { nodes: JobPosting[] };
  touristspots: { nodes: Touristspot[] };
  events: { nodes: WPEvent[] };
}

export async function getAreaWithPosts(slug: string): Promise<AreaWithPosts | null> {
  try {
    const data = await wpClient.request<{ area: AreaWithPosts | null }>(
      GET_AREA_WITH_POSTS,
      { slug },
    );

    return data.area;
  } catch (error) {
    console.error("Failed to fetch area with posts:", error);
    return null;
  }
}
