import { IsString, IsIn } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsString()
  @IsIn(['owner', 'admin', 'member'])
  role: 'owner' | 'admin' | 'member';
}
