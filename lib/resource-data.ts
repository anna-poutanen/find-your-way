export type ResourceCategory =
  | "Emergency shelter"
  | "Youth housing"
  | "Women's housing"
  | "Community support";

export type Resource = {
  id: string;
  slug: string;
  name: string;
  category: ResourceCategory;
  city: string;
  address: string;
  phone: string;
  email?: string;
  hours: string;
  summary: string;
  description: string;
  eligibility: string;
  tags: string[];
  programs: string[];
  ageRange?: string;
  verified: string;
  featured?: boolean;
};

export const resources: Resource[] = [
  {
    id: "nightshift",
    slug: "nightshift-ministries",
    name: "Nightshift Ministries",
    category: "Emergency shelter",
    city: "Surrey",
    address: "10635 King George Boulevard, Surrey, BC",
    phone: "604-953-1114",
    email: "info@nightshiftministries.org",
    hours: "Outreach 7–8:30 PM daily · Drop-in 2–4 PM weekdays",
    summary: "Nightly outreach, meals, drop-in care and extreme-weather shelter in Surrey.",
    description:
      "Nightshift Street Ministries serves people experiencing homelessness, poverty, addiction and mental illness through year-round street outreach and practical support.",
    eligibility: "Open to people experiencing homelessness, poverty, addiction or mental illness.",
    tags: ["Meals", "Drop-in", "Health care", "Harm reduction"],
    programs: [
      "Nightly hot meals and mobile outreach",
      "The Care Centre weekday drop-in",
      "Selah extreme-weather shelter",
      "Care Bus nursing and counselling",
      "Housing, identification and MSP application support",
    ],
    verified: "January 2026",
    featured: true,
  },
  {
    id: "covenant-house",
    slug: "covenant-house-vancouver",
    name: "Covenant House Vancouver",
    category: "Youth housing",
    city: "Vancouver",
    address: "1280 Seymour Street, Vancouver, BC",
    phone: "604-685-7474",
    email: "ROP@covenanthousebc.org",
    hours: "Shelter open 24/7 · Drop-in 9 AM–5:30 PM weekdays",
    summary: "Low-barrier crisis shelter, transitional housing and wraparound youth services.",
    description:
      "Covenant House provides round-the-clock housing and individualized support to young people experiencing or at risk of homelessness and human trafficking.",
    eligibility: "Youth ages 16–24. Gender-specific and 2SLGBTQIA+ inclusive spaces are available.",
    tags: ["24/7", "Meals", "Accessible", "2SLGBTQIA+"],
    programs: [
      "Residential Crisis Program",
      "Rights of Passage transitional housing",
      "Drop-in centre and street outreach",
      "Mental health, substance use and education support",
    ],
    ageRange: "16–24",
    verified: "January 2026",
    featured: true,
  },
  {
    id: "atira",
    slug: "atira-womens-resource-society",
    name: "Atira Women's Resource Society",
    category: "Women's housing",
    city: "Lower Mainland",
    address: "Vancouver, Burnaby, Surrey, White Rock and Richmond",
    phone: "604-681-4437",
    email: "hppsurrey@atira.bc.ca",
    hours: "Office 8:30 AM–5 PM weekdays · Shelters open 24/7",
    summary: "Emergency, transition and supportive housing for women and children.",
    description:
      "Atira provides low-barrier, trauma-informed housing and support for women and children affected by violence across the Lower Mainland.",
    eligibility: "Women, including trans, two-spirit, intersex and femme-of-centre non-binary people.",
    tags: ["24/7", "Trauma-informed", "Harm reduction", "Legal support"],
    programs: [
      "Bridge Housing for Women",
      "Maxxine Wright crisis and second-stage housing",
      "Homelessness prevention and housing outreach",
      "Counselling, advocacy and parenting support",
    ],
    ageRange: "16+",
    verified: "January 2026",
    featured: true,
  },
  {
    id: "cyrus-centre",
    slug: "cyrus-centre-ministries",
    name: "Cyrus Centre Ministries",
    category: "Youth housing",
    city: "Abbotsford & Chilliwack",
    address: "2616 Ware Street, Abbotsford · 45845 Wellington Avenue, Chilliwack",
    phone: "604-859-5773",
    email: "admin@cyruscentre.com",
    hours: "Emergency support available 24/7",
    summary: "Emergency shelter, meals, advocacy and care for Fraser Valley youth.",
    description:
      "Cyrus Centre provides emergency accommodation and practical support for youth in the Fraser Valley and Fraser Canyon.",
    eligibility: "Youth ages 12–24 who are homeless or at risk. Self-referrals are accepted.",
    tags: ["Meals", "Self-referral", "Counselling", "Housing search"],
    programs: ["Emergency shelter", "Resource centre", "Youth food bank", "Employment coaching"],
    ageRange: "12–24",
    verified: "January 2026",
  },
  {
    id: "lookout",
    slug: "lookout-housing-and-health-society",
    name: "Lookout Housing and Health Society",
    category: "Emergency shelter",
    city: "Lower Mainland",
    address: "Multiple locations across Metro Vancouver and the Fraser Valley",
    phone: "604-255-0340",
    hours: "Shelters open 24/7",
    summary: "Low-barrier shelters, supportive housing, outreach and health services.",
    description:
      "Lookout operates shelters, outreach teams, supportive housing and health services for adults facing multiple barriers.",
    eligibility: "Adults 19+ experiencing or at risk of homelessness.",
    tags: ["24/7", "Pet-friendly sites", "Accessible sites", "Harm reduction"],
    programs: ["Emergency shelters", "Housing outreach", "Medical and dental care", "Food bank"],
    ageRange: "19+",
    verified: "January 2026",
  },
  {
    id: "directions",
    slug: "directions-youth-services",
    name: "Directions Youth Services",
    category: "Youth housing",
    city: "Vancouver",
    address: "1138 Burrard Street, Vancouver, BC",
    phone: "604-633-1472",
    email: "contactus@fsgv.ca",
    hours: "Drop-in open 24/7 · Overnight shelter 10 PM–8 AM",
    summary: "Youth drop-in, overnight shelter, longer-term housing and outreach.",
    description:
      "Directions offers low-barrier shelter, food, hygiene, employment and transition support for young people in Vancouver.",
    eligibility: "Programs serve youth ages 13–24, depending on the service.",
    tags: ["24/7 drop-in", "Pets", "No ID required", "Meals"],
    programs: ["Overnight shelter", "Safehouse and Haven", "Food program", "Youth outreach"],
    ageRange: "13–24",
    verified: "January 2026",
  },
  {
    id: "north-shore-safehouse",
    slug: "north-shore-youth-safehouse",
    name: "North Shore Youth Safehouse",
    category: "Youth housing",
    city: "North Vancouver",
    address: "North Vancouver, BC",
    phone: "1-877-789-6884",
    email: "nsysh@hollyburnsociety.ca",
    hours: "Staffed 24/7",
    summary: "Short-term emergency accommodation and stabilization support for youth.",
    description:
      "A small youth safehouse providing emergency beds, meals, hygiene facilities and referrals through Hollyburn Community Services Society.",
    eligibility: "Youth ages 13–18. Self-referrals and agency referrals are accepted.",
    tags: ["24/7", "Self-referral", "Meals", "Youth workers"],
    programs: ["Emergency accommodation", "Transitional support", "Counselling referrals"],
    ageRange: "13–18",
    verified: "January 2026",
  },
  {
    id: "surrey-food-bank",
    slug: "surrey-food-bank",
    name: "Surrey Food Bank",
    category: "Community support",
    city: "Surrey",
    address: "13478 78th Avenue, Surrey, BC",
    phone: "604-581-5443",
    email: "hampers@surreyfoodbank.org",
    hours: "Hamper distribution 9 AM–1 PM Mon, Tue, Thu & Fri",
    summary: "Emergency food hampers, family nutrition programs and referrals.",
    description:
      "The Surrey Food Bank provides emergency food and connects clients with housing, income and social support programs.",
    eligibility: "Serves Surrey residents north of 40th Avenue and North Delta. Registration is required.",
    tags: ["Food", "Family support", "Home delivery", "Referrals"],
    programs: ["Regular hampers", "Tiny Bundles", "Kids First", "Seniors distribution"],
    verified: "January 2026",
  },
  {
    id: "foundry-surrey",
    slug: "foundry-surrey",
    name: "Foundry Surrey",
    category: "Community support",
    city: "Surrey",
    address: "Surrey, BC",
    phone: "604-677-4983",
    hours: "Contact for current drop-in hours",
    summary: "Integrated health and social services for youth and young adults.",
    description:
      "Foundry Surrey connects young people with mental health, substance use, primary care and social services in one youth-friendly setting.",
    eligibility: "Youth and young adults ages 12–24.",
    tags: ["Mental health", "Primary care", "Harm reduction", "2SLGBTQIA+"],
    programs: ["Mental health support", "Primary care", "Peer support", "Social services"],
    ageRange: "12–24",
    verified: "January 2026",
  },
  {
    id: "out-of-rain",
    slug: "out-of-the-rain-youth-shelter",
    name: "Out of the Rain Youth Shelter",
    category: "Youth housing",
    city: "Victoria",
    address: "Rotating host sites in Victoria, BC",
    phone: "250-415-3856",
    hours: "8 PM–7:30 AM seasonally",
    summary: "Seasonal, first-come youth shelter with meals and referrals.",
    description:
      "A community coalition shelter operated by Beacon Community Services during the colder months.",
    eligibility: "Youth ages 15–25. No advance sign-up required.",
    tags: ["Seasonal", "Pet-friendly", "Meals", "Walk-in"],
    programs: ["Overnight shelter", "Evening meal", "Light breakfast", "Resource referrals"],
    ageRange: "15–25",
    verified: "January 2026",
  },
];

export const categories = ["All", "Emergency shelter", "Youth housing", "Women's housing", "Community support"] as const;

export function getResource(slug: string) {
  return resources.find((resource) => resource.slug === slug);
}
