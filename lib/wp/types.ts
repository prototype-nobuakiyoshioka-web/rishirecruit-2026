export interface WPMediaDetails {
  width: number;
  height: number;
}

export interface WPImageNode {
  node: {
    sourceUrl: string;
    altText: string | null;
    mediaDetails?: WPMediaDetails | null;
  } | null;
}

export interface WPGalleryNodes {
  nodes: Array<{
    sourceUrl: string;
    altText?: string | null;
    mediaDetails?: WPMediaDetails | null;
  }>;
}

export interface JobPosting {
  id: string;
  slug: string;
  title: string;
  jobPostingFields: {
    employmentType: string[] | null;
    catchCopy: string | null;
    salary: string | null;
    salaryDetail: string | null;
    workHours: string | null;
    workHoursDetail: string | null;
    holiday: string | null;
    socialInsurance: string | null;
    benefits: string | null;
    housingSupportAvailable: boolean | null;
    housingSupportDetail: string | null;
    smokingPolicy: string | null;
    trialPeriod: string | null;
    workAddress: string | null;
    workAddressDetail: string | null;
    pinLocation: string[] | null;
    description: string | null;
    desiredPerson: string | null;
    requiredQualifications: string | null;
    applicationFlow: string | null;
    thumbnailImage: WPImageNode | null;
    thumbnailVideoUrl: string | null;
  } | null;
}

export interface Touristspot {
  id: string;
  slug: string;
  title: string;
  touristspotFields: {
    category: string[] | null;
    catchCopy: string | null;
    description: string | null;
    bestSeason: string | null;
    address: string | null;
    accessInfo: string | null;
    openHours: string | null;
    closedDays: string | null;
    price: string | null;
    phone: string | null;
    websiteUrl: string | null;
    thumbnailImage: WPImageNode | null;
    thumbnailVideoUrl: string | null;
    galleryImages: WPGalleryNodes | null;
  } | null;
}

export interface WPEvent {
  id: string;
  slug: string;
  title: string;
  eventFields: {
    category: string[] | null;
    catchCopy: string | null;
    startDatetime: string | null;
    endDatetime: string | null;
    isRecurring: boolean | null;
    recurrenceNote: string | null;
    organizer: string | null;
    description: string | null;
    venueName: string | null;
    address: string | null;
    accessInfo: string | null;
    pinReference: string | null;
    price: string | null;
    registrationUrl: string | null;
    contact: string | null;
    thumbnailImage: WPImageNode | null;
    thumbnailVideoUrl: string | null;
    galleryImages: WPGalleryNodes | null;
  } | null;
}

export interface Testimonial {
  id: string;
  slug: string;
  title: string;
  testimonialFields: {
    catchCopy: string | null;
    photo: WPImageNode | null;
    profileBefore: string | null;
    profileAfter: string | null;
    migrationYear: string | null;
    leadText: string | null;
    interviewBody: string | null;
    galleryImages: WPGalleryNodes | null;
    relatedJob: {
      nodes: Array<{
        __typename: "JobPosting";
        id: string;
        slug: string;
        title: string;
        jobPostingFields?: {
          employmentType: string[] | null;
          catchCopy: string | null;
        } | null;
      }>;
    } | null;
  } | null;
}
