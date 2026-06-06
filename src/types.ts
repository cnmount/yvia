export interface Course {
  id: string;
  name: string;
  nameZh: string;
  source: string;
  description: string;
  descriptionZh: string;
  ageGroup: string;
  duration: string;
  keyConcepts: string[];
  images: string[];
  approved: boolean;
  notes?: string;
}

export interface EventItem {
  id: string;
  title: string;
  titleZh: string;
  status: 'past' | 'upcoming';
  location: string;
  date: string;
  description: string;
  descriptionZh: string;
  targetAudience: string;
  images: string[];
  approved: boolean;
  notes?: string;
}

export interface WebsiteSettings {
  primaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroSubtitle: string;
}

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  country: string;
  city: string;
  neighborhood: string;
  profession: string;
  professionalTitle: string;
  desiredTracks: string[];
  surplusSkills: string[];
  submittedAt: string;
}
