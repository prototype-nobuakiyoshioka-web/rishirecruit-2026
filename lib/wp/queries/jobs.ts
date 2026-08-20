import { gql } from "graphql-request";
import { wpClient } from "../client";
import type { JobPosting } from "../types";

const JOB_POSTING_CARD_FIELDS = gql`
  fragment JobPostingCardFields on JobPosting {
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
    jobPostingFields {
      employmentType
      catchCopy
      salary
      workHours
      pinLocation
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

const GET_JOB_POSTINGS = gql`
  ${JOB_POSTING_CARD_FIELDS}
  query GetJobPostings {
    jobPostings(first: 100, where: { status: PUBLISH }) {
      nodes {
        ...JobPostingCardFields
      }
    }
  }
`;

const GET_JOB_POSTING_BY_SLUG = gql`
  query GetJobPostingBySlug($slug: ID!) {
    jobPosting(id: $slug, idType: SLUG) {
      id
      slug
      title
      date
      areas {
        nodes {
          id
          name
          slug
        }
      }
      jobPostingFields {
        employmentType
        catchCopy
        salary
        salaryDetail
        workHours
        workHoursDetail
        holiday
        socialInsurance
        benefits
        housingSupportAvailable
        housingSupportDetail
        smokingPolicy
        trialPeriod
        workAddress
        workAddressDetail
        pinLocation
        description
        desiredPerson
        requiredQualifications
        applicationFlow
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
  }
`;

export async function getJobPostings(): Promise<JobPosting[]> {
  try {
    const data = await wpClient.request<{ jobPostings: { nodes: JobPosting[] } }>(
      GET_JOB_POSTINGS,
    );

    return data.jobPostings.nodes;
  } catch (error) {
    console.error("Failed to fetch job postings:", error);
    return [];
  }
}

export async function getJobPostingBySlug(slug: string): Promise<JobPosting | null> {
  try {
    const data = await wpClient.request<{ jobPosting: JobPosting | null }>(
      GET_JOB_POSTING_BY_SLUG,
      { slug },
    );

    return data.jobPosting;
  } catch (error) {
    console.error(`Failed to fetch job posting by slug "${slug}":`, error);
    return null;
  }
}
