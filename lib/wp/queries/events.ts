import { gql } from "graphql-request";
import { wpClient } from "../client";
import type { WPEvent } from "../types";

const EVENT_CARD_FIELDS = gql`
  fragment EventCardFields on Event {
    id
    slug
    title
    areas {
      nodes {
        id
        name
        slug
      }
    }
    eventFields {
      category
      catchCopy
      dateDisplayType
      periodMonth
      periodRange
      startDatetime
      endDatetime
      venueName
      thumbnailImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      thumbnailVideoUrl
    }
  }
`;

const GET_EVENTS = gql`
  ${EVENT_CARD_FIELDS}
  query GetEvents {
    events(first: 100, where: { status: PUBLISH }) {
      nodes {
        ...EventCardFields
      }
    }
  }
`;

const GET_EVENT_BY_SLUG = gql`
  query GetEventBySlug($slug: ID!) {
    event(id: $slug, idType: SLUG) {
      id
      slug
      title
      areas {
        nodes {
          id
          name
          slug
        }
      }
      eventFields {
        category
        catchCopy
        dateDisplayType
        periodMonth
        periodRange
        startDatetime
        endDatetime
        isRecurring
        recurrenceNote
        description
        venueName
        address
        accessInfo
        pinReference
        price
        registrationUrl
        contact
        thumbnailImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        thumbnailVideoUrl
        galleryImages {
          nodes {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;

export async function getEvents(): Promise<WPEvent[]> {
  try {
    const data = await wpClient.request<{ events: { nodes: WPEvent[] } }>(GET_EVENTS);

    return data.events.nodes;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<WPEvent | null> {
  try {
    const data = await wpClient.request<{ event: WPEvent | null }>(GET_EVENT_BY_SLUG, {
      slug,
    });

    return data.event;
  } catch (error) {
    console.error(`Failed to fetch event by slug "${slug}":`, error);
    return null;
  }
}
