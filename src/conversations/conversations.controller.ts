import { Controller, Post, Get, Req, Param, Body, Patch, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { UserConfirmDto } from './dto/user-confirm.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conversations')
@ApiBearerAuth('jwt')
export class ConversationsController {
  constructor(private convoService: ConversationsService) {}

  @Post()
  create(@Body() body: CreateConversationDto, @Req() req) {
    return this.convoService.createConversation(req.user.userId);
  }

  @Get()
  getMine(@Req() req) {
    return this.convoService.getUserConversations(req.user.userId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.convoService.getConversationById(id);
  }

  @Patch(':id/escalate')
  escalate(@Param('id') id: string) {
       return this.convoService.escalateConversation(id);
   }

   @Patch(':id/resolve')
   @Roles(Role.AGENT)
    agentResolve(@Param('id') id: string, @Req() req) {
      return this.convoService.agentMarkResolved(id, req.user.userId);
    }

    @Patch(':id/confirm')
    @Roles(Role.USER)
    userConfirm(@Param('id') id: string, @Req() req, @Body() body: UserConfirmDto) {
      return this.convoService.userConfirmResolution(id, req.user.userId, body.confirm);
    }

    @Get('admin/all')
    @Roles(Role.ADMIN)
    getAll(){
        console.log(Role)
        return this.convoService.getALlConversations()
    }
}