export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  description?: string;
}

export interface InviteMemberDto {
  email: string;
  role: 'admin' | 'member';
}

export interface UpdateMemberRoleDto {
  role: 'admin' | 'member';
}
