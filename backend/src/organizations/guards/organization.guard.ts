import { Injectable, CanActivate, ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrganizationsService } from '../organizations.service';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private organizationsService: OrganizationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get organization ID from header
    const orgId = request.headers['x-organization-id'];

    if (!orgId) {
      throw new BadRequestException('Organization ID is required in x-organization-id header');
    }

    // Check if user is a member of this organization
    const role = await this.organizationsService.getUserRole(user.id, orgId);

    if (!role) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    // Attach organization context to request
    request.organization = {
      id: orgId,
      role,
    };

    return true;
  }
}
