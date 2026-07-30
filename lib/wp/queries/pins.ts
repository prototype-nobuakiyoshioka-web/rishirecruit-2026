import { gql } from "graphql-request";
import { wpClient } from "../client";
import type { WPImageNode } from "../types";

export type PinItemType = "job" | "spot" | "event";

export interface PinItem {
  id: string;
  slug: string;
  title: string;
  type: PinItemType;
  positionKey: string;
  catchCopy: string | null;
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  employmentType?: string | null;
  salary?: string | null;
  category?: string | null;
  startDatetime?: string | null;
}

interface JobPostingPinNode {
  id: string;
  slug: string;
  title: string;
  jobPostingFields: {
    employmentType: string[] | null;
    catchCopy: string | null;
    salary: string | null;
    pinLocation: string[] | null;
    thumbnailImage: WPImageNode | null;
  } | null;
}

interface TouristspotPinNode {
  id: string;
  slug: string;
  title: string;
  touristspotFields: {
    category: string[] | null;
    catchCopy: string | null;
    thumbnailImage: WPImageNode | null;
  } | null;
}

interface EventPinNode {
  id: string;
  slug: string;
  title: string;
  eventFields: {
    category: string[] | null;
    catchCopy: string | null;
    startDatetime: string | null;
    pinReference: string | null;
    thumbnailImage: WPImageNode | null;
  } | null;
}

interface PinDataResponse {
  jobPostings: {
    nodes: JobPostingPinNode[];
  };
  touristspots: {
    nodes: TouristspotPinNode[];
  };
  events: {
    nodes: EventPinNode[];
  };
}

const GET_PIN_DATA = gql`
  query GetPinData {
    jobPostings(first: 100, where: { status: PUBLISH }) {
      nodes {
        id
        slug
        title
        jobPostingFields {
          employmentType
          catchCopy
          salary
          pinLocation
          thumbnailImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
    touristspots(first: 100, where: { status: PUBLISH }) {
      nodes {
        id
        slug
        title
        touristspotFields {
          category
          catchCopy
          thumbnailImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
    events(first: 100, where: { status: PUBLISH }) {
      nodes {
        id
        slug
        title
        eventFields {
          category
          catchCopy
          startDatetime
          pinReference
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
`;

function getImageUrl(image: WPImageNode | null): string | null {
  return image?.node?.sourceUrl ?? null;
}

function getImageAlt(image: WPImageNode | null): string | null {
  return image?.node?.altText ?? null;
}

export async function getPinData(): Promise<PinItem[]> {
  try {
    const data = await wpClient.request<PinDataResponse>(GET_PIN_DATA);

    const jobPins = data.jobPostings.nodes
      .map((node): PinItem | null => {
        const fields = node.jobPostingFields;
        const positionKey = fields?.pinLocation?.[0];
        if (!fields || !positionKey) return null;

        return {
          id: node.id,
          slug: node.slug,
          title: node.title,
          type: "job",
          positionKey,
          catchCopy: fields.catchCopy,
          thumbnailUrl: getImageUrl(fields.thumbnailImage),
          thumbnailAlt: getImageAlt(fields.thumbnailImage),
          employmentType: fields.employmentType?.[0] ?? null,
          salary: fields.salary,
        };
      })
      .filter((pin): pin is PinItem => pin !== null);

    const spotPins = data.touristspots.nodes.map((node): PinItem => {
      const fields = node.touristspotFields;

      return {
        id: node.id,
        slug: node.slug,
        title: node.title,
        type: "spot",
        positionKey: node.slug,
        catchCopy: fields?.catchCopy ?? null,
        thumbnailUrl: getImageUrl(fields?.thumbnailImage ?? null),
        thumbnailAlt: getImageAlt(fields?.thumbnailImage ?? null),
        category: fields?.category?.[0] ?? null,
      };
    });

    const eventPins = data.events.nodes
      .map((node): PinItem | null => {
        const fields = node.eventFields;
        const positionKey = fields?.pinReference;
        if (!fields || !positionKey) return null;

        return {
          id: node.id,
          slug: node.slug,
          title: node.title,
          type: "event",
          positionKey,
          catchCopy: fields.catchCopy,
          thumbnailUrl: getImageUrl(fields.thumbnailImage),
          thumbnailAlt: getImageAlt(fields.thumbnailImage),
          category: fields.category?.[0] ?? null,
          startDatetime: fields.startDatetime,
        };
      })
      .filter((pin): pin is PinItem => pin !== null);

    return [...jobPins, ...spotPins, ...eventPins];
  } catch (error) {
    console.error("Failed to fetch pin data:", error);
    return [];
  }
}
