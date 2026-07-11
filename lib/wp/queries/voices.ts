import { gql } from "graphql-request";
import { wpClient } from "../client";
import type { Testimonial } from "../types";

const TESTIMONIAL_CARD_FIELDS = gql`
  fragment TestimonialCardFields on Testimonial {
    id
    slug
    title
    testimonialFields {
      catchCopy
      migrationYear
      photo {
        node {
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
`;

const GET_TESTIMONIALS = gql`
  ${TESTIMONIAL_CARD_FIELDS}
  query GetTestimonials {
    testimonials(first: 100, where: { status: PUBLISH }) {
      nodes {
        ...TestimonialCardFields
      }
    }
  }
`;

const GET_TESTIMONIAL_BY_SLUG = gql`
  query GetTestimonialBySlug($slug: ID!) {
    testimonial(id: $slug, idType: SLUG) {
      id
      slug
      title
      testimonialFields {
        catchCopy
        photo {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        profileBefore
        profileAfter
        migrationYear
        leadText
        interviewBody
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
        relatedJob {
          nodes {
            ... on JobPosting {
              __typename
              id
              slug
              title
              jobPostingFields {
                employmentType
                catchCopy
              }
            }
          }
        }
      }
    }
  }
`;

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const data = await wpClient.request<{ testimonials: { nodes: Testimonial[] } }>(
      GET_TESTIMONIALS,
    );

    return data.testimonials.nodes;
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return [];
  }
}

export async function getTestimonialBySlug(slug: string): Promise<Testimonial | null> {
  try {
    const data = await wpClient.request<{ testimonial: Testimonial | null }>(
      GET_TESTIMONIAL_BY_SLUG,
      { slug },
    );

    return data.testimonial;
  } catch (error) {
    console.error(`Failed to fetch testimonial by slug "${slug}":`, error);
    return null;
  }
}
