import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { SenderType } from '../messages/schemas/message.schema';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private messageService: MessagesService,
    private jwtService: JwtService
  ) {}

  handleConnection(client: Socket) {
    try{
        const token = client.handshake.auth.token;

        if(!token){
            client.disconnect();
            return;
        }

        const payload = this.jwtService.verify(token);

        client.data.user = payload

        console.log("Authenticated socket:", payload)
    }catch(error){
         console.log("Invalid token")
         client.disconnect()
    }
    
  }

  // Join room safely
  @SubscribeMessage('joinConversation')
  handleJoin(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    if (!user) return;
    
    if (!client.rooms.has(conversationId)) {
      client.join(conversationId);
    }
    return { message: 'Joined conversation' };
  }

  // Send message
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {

    const user = client.data.user;
    if(!user){
        return {error: 'Unauthorized'}
    }
    console.log('sendMessage triggered:', client.id);
    const { conversationId, message} = body;

    if(!Types.ObjectId.isValid(conversationId)){
       return {error: 'Invalid conversation id'}
    }

    
    const savedMessage = await this.messageService.createMessage({
      conversationId,
      message,
      senderType:
        user.role === 'agent' ? SenderType.AGENT : SenderType.USER,
      senderId: user.sub,
    });

    
    this.server.to(conversationId).emit('newMessage', savedMessage);

    
    return { success: true };
  }
}