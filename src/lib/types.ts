export type FreelancerStatus = "Pending" | "Approved" | "Rejected";

export type ClientRequest = {
  id: number;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  location: string;
  ushersNeeded: number;
  notes: string;
  isRowDeleted?: boolean;
  createdAt: string;
};

export type Freelancer = {
  id: number;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  city: string;
  experience: string;
  languages: string;
  availability: string;
  profilePhoto?: string;
  cv?: string;
  // Binary data stored in DB (not returned by read endpoints by default)
  profilePhotoData?: Buffer | null;
  cvData?: Buffer | null;
  status: FreelancerStatus;
  isRowDeleted?: boolean;
  createdAt: string;
};

export type Database = {
  clients: ClientRequest[];
  freelancers: Freelancer[];
};
