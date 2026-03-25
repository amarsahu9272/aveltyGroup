export type ProjectType = 'Residential' | 'Commercial' | 'Roads' | 'Infrastructure';
export type ProjectStatus = 'Ongoing' | 'Completed';

export interface StatusHistoryEntry {
  status: ProjectStatus;
  updatedAt: string;
  updatedBy: string;
  comment?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  type: ProjectType;
  status: ProjectStatus;
  imageUrl?: string;
  gallery?: string[];
  timeline?: string;
  createdAt: string;
  updatedAt: string;
  staffAssigned?: string[];
  statusHistory?: StatusHistoryEntry[];
}

export type LeadStatus = 'New' | 'Contacted' | 'Converted' | 'Closed';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  requirement: string;
  status: LeadStatus;
  createdAt: string;
}

export type UserRole = 'admin' | 'staff';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
}

export type NotificationType = 'project_status_change' | 'new_lead';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  createdAt: string;
  read?: boolean;
}
