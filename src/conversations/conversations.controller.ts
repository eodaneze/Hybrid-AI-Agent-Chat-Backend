import { Controller, Post, Get, Req, Param, Body, Patch } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

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
}