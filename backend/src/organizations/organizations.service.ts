import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    // Check if slug is already taken
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Organization with slug "${dto.slug}" already exists`);
    }

    // Create organization with the creator as owner
    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return organization;
  }

  async findAllForUser(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return memberships.map(m => ({
      ...m.organization,
      role: m.role,
    }));
  }

  async findOne(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(userId: string, organizationId: string, dto: UpdateOrganizationDto) {
    await this.checkUserRole(userId, organizationId, ['owner', 'admin']);

    const organization = await this.prisma.organization.update({
      where: { id: organizationId },
      data: dto,
    });

    return organization;
  }

  async delete(userId: string, organizationId: string) {
    await this.checkUserRole(userId, organizationId, ['owner']);

    await this.prisma.organization.delete({
      where: { id: organizationId },
    });
  }

  async inviteMember(userId: string, organizationId: string, dto: InviteMemberDto) {
    await this.checkUserRole(userId, organizationId, ['owner', 'admin']);

    // Find user by email
    const userToInvite = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!userToInvite) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const existing = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: userToInvite.id,
          organizationId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this organization');
    }

    // Add member
    const member = await this.prisma.organizationMember.create({
      data: {
        userId: userToInvite.id,
        organizationId,
        role: dto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return member;
  }

  async removeMember(userId: string, organizationId: string, memberId: string) {
    await this.checkUserRole(userId, organizationId, ['owner', 'admin']);

    const member = await this.prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === 'owner') {
      throw new BadRequestException('Cannot remove organization owner');
    }

    await this.prisma.organizationMember.delete({
      where: { id: memberId },
    });
  }

  async updateMemberRole(userId: string, organizationId: string, memberId: string, dto: UpdateMemberRoleDto) {
    await this.checkUserRole(userId, organizationId, ['owner']);

    const member = await this.prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const updated = await this.prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async checkUserRole(userId: string, organizationId: string, allowedRoles: string[]) {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return member;
  }

  async getUserRole(userId: string, organizationId: string): Promise<string | null> {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return member?.role || null;
  }

  async getMembers(organizationId: string) {
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return members;
  }
}
