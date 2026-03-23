import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SenderType } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('messages')
@ApiBearerAuth('jwt')
export class MessagesController {
  constructor(private messageService: MessagesService) {}

  @Post()
  sendMessage(@Body() body: CreateMessageDto, @Req() req) {
    return this.messageService.createMessage({
      conversationId: body.conversationId,
      message: body.message,
      senderType: SenderType.USER,
      senderId: req.user.userId,
    });
  }

  @Get(':conversationId')
  getMessages(@Param('conversationId') conversationId: string) {
    return this.messageService.getMessages(conversationId);
  }
}