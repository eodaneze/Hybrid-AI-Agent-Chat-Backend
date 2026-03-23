import { Controller, Get, Req } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@ApiBearerAuth('jwt')
export class UsersController {
  @Get('me')
  getMe(@Req() req) {
    return req.user;
  }

  @Get('agents-only')
  @Roles(Role.AGENT, Role.ADMIN)
  agentsOnly() {
    return { message: 'Only agents/admins can see this' };
  }
}