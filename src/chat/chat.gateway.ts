import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { SenderType } from '../messages/schemas/message.schema';

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection {
  constructor(private messageService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  // Join a conversation room
  @SubscribeMessage('joinConversation')
  handleJoin(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
    return { message: 'Joined conversation' };
  }

  // Send message
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId, message, senderId, role } = body;

    const savedMessage = await this.messageService.createMessage({
      conversationId,
      message,
      senderType:
        role === 'agent' ? SenderType.AGENT : SenderType.USER,
      senderId,
    });

    // Broadcast to everyone in that conversation
    client.to(conversationId).emit('newMessage', savedMessage);

    return savedMessage;
  }
}