import { IsString, IsEmail, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class InviteMemberDto {
  @IsString()
  relationship: string;

  @IsEmail()
  memberEmail: string;
}

export class InviteFamilyMembersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteMemberDto)  // Important to ensure validation works correctly with nested objects
  members: InviteMemberDto[];
}
