import { gql } from "graphql-request";
import { wpClient } from "../client";
import type { Touristspot } from "../types";

const TOURISTSPOT_CARD_FIELDS = gql`
  fragment TouristspotCardFields on Touristspot {
    id
    slug
    title
    touristspotFields {
      category
      catchCopy
      accessInfo
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

const GET_TOURISTSPOTS = gql`
  ${TOURISTSPOT_CARD_FIELDS}
  query GetTouristspots {
    touristspots(first: 100, where: { status: PUBLISH }) {
      nodes {
        ...TouristspotCardFields
      }
    }
  }
`;

const GET_TOURISTSPOT_BY_SLUG = gql`
  query GetTouristspotBySlug($slug: ID!) {
    touristspot(id: $slug, idType: SLUG) {
      id
      slug
      title
      touristspotFields {
        category
        catchCopy
        description
        bestSeason
        address
        accessInfo
        openHours
        closedDays
        price
        phone
        websiteUrl
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

export async function getTouristspots(): Promise<Touristspot[]> {
  try {
    const data = await wpClient.request<{ touristspots: { nodes: Touristspot[] } }>(
      GET_TOURISTSPOTS,
    );

    return data.touristspots.nodes;
  } catch (error) {
    console.error("Failed to fetch touristspots:", error);
    return [];
  }
}

export async function getTouristspotBySlug(slug: string): Promise<Touristspot | null> {
  try {
    const data = await wpClient.request<{ touristspot: Touristspot | null }>(
      GET_TOURISTSPOT_BY_SLUG,
      { slug },
    );

    return data.touristspot;
  } catch (error) {
    console.error(`Failed to fetch touristspot by slug "${slug}":`, error);
    return null;
  }
}
