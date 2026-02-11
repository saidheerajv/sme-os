import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

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

  async createUser(currentUserId: string, organizationId: string, dto: CreateUserDto) {
    await this.checkUserRole(currentUserId, organizationId, ['owner', 'admin']);

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // Create user and add them to the organization
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        organizationMembers: {
          create: {
            organizationId,
            role: dto.role,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        organizationMembers: {
          where: { organizationId },
          select: {
            id: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      id: user.organizationMembers[0].id,
      role: user.organizationMembers[0].role,
      createdAt: user.organizationMembers[0].createdAt,
      updatedAt: user.organizationMembers[0].createdAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
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
