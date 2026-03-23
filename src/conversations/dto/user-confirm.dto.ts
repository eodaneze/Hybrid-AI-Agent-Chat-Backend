import { ApiProperty } from '@nestjs/swagger';

export class UserConfirmDto {
  @ApiProperty({
    description: 'Confirm the resolution of the conversation',
    example: true,
  })
  confirm: boolean;
}