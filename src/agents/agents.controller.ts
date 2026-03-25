import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('agents')
@ApiBearerAuth('jwt')
@Roles(Role.AGENT)
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Get('assigned')
  getAssigned(@Req() req) {
    console.log(`the agent id is ${req.user.userId}`)
    return this.agentsService.getAssigned(req.user.userId);
  }

  @Get('active')
  getActive(@Req() req) {
    return this.agentsService.getActive(req.user.userId);
  }

  @Get('pending')
  getPending(@Req() req) {
    return this.agentsService.getPending(req.user.userId);
  }

  @Get('stats')
  getStats(@Req() req) {
    return this.agentsService.getStats(req.user.userId);
  }
}