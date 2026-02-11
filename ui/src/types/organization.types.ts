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

export interface InviteMemberDto {
  email: string;
  role: 'admin' | 'member';
}

export interface UpdateMemberRoleDto {
  role: 'admin' | 'member';
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'member';
}
