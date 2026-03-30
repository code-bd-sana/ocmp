export interface ParticipantRoleItem {
  _id: string;
  roleName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParticipantRoleListResponse {
  roles: ParticipantRoleItem[];
  totalData: number;
  totalPages: number;
}

export interface ParticipantListItem {
  _id: string;
  firstName: string;
  lastName: string;
  role?: {
    _id?: string;
    roleName?: string;
  } | null;
  employmentStatus: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParticipantListResponse {
  participants: ParticipantListItem[];
  totalData: number;
  totalPages: number;
}

export interface ParticipantDetail {
  _id: string;
  firstName: string;
  lastName: string;
  role?: {
    _id?: string;
    roleName?: string;
  } | null;
  employmentStatus: boolean;
  standAloneId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateParticipantInput {
  firstName: string;
  lastName: string;
  role: string;
  employmentStatus: boolean;
  standAloneId?: string;
}

export interface UpdateParticipantInput {
  firstName?: string;
  lastName?: string;
  role?: string;
  employmentStatus?: boolean;
}

export interface CreateParticipantRoleInput {
  roleName: string;
  standAloneId?: string;
}

export interface UpdateParticipantRoleInput {
  roleName: string;
}
