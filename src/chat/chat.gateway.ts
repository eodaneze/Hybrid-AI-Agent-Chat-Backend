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
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation } from 'src/conversations/schemas/conversation.schema';

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
    private jwtService: JwtService,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
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

        // Join user-specific room for notifications
        client.join(`user_${payload.sub}`)

        // console.log("Authenticated socket:", payload)
    }catch(error){
         console.log("Invalid token")
         client.disconnect()
    }
    
  }

  // Join room safely
  @SubscribeMessage('joinConversation')
  async handleJoin(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    if (!user){
      client.disconnect()
      return;
    } 

     
    if (!Types.ObjectId.isValid(conversationId)) {
      return { error: 'Invalid conversation id' };
    }

     const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      return { error: 'Conversation not found' };
    }

    const isUserOwner = conversation.userId.toString() === user.sub;
    const isAssignedAgent =
      conversation.assignedAgentId &&
      conversation.assignedAgentId.toString() === user.sub;

    const isAdmin = user.role === 'admin';

    if (!isUserOwner && !isAssignedAgent && !isAdmin) {
      client.emit('error', 'Access denied');
    }
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


    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      return { error: 'Conversation not found' };
    }

    
    const isUserOwner = conversation.userId.toString() === user.sub;

    const isMainAgent = 
       conversation.assignedAgentId && 
       conversation.assignedAgentId.toString() === user.sub

    const isSubAgent = 
      conversation.subAgents && 
      conversation.subAgents.some(
        (id) => id.toString() === user.sub
      );

    const isAdmin = user.role === 'admin';

    if (!isUserOwner && !isMainAgent && !isSubAgent  && !isAdmin) {
      client.emit('error', 'Access denied');
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

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() body: {conversationId: string},
    @ConnectedSocket() client: Socket,
  ){
     const user = client.data.user;
     if(!user) return;

     const {conversationId} = body;

     if(!conversationId) return;

     client.to(conversationId).emit('typing', {
        userId: user.sub,
        role: user.role
     })
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() body: {conversationId: string},
    @ConnectedSocket() client: Socket,
  ){
     const user = client.data.user;
     if(!user) return;
      const {conversationId} = body;

      client.to(conversationId).emit('stopTyping', {
          userId: user.sub,
          role: user.role
      })
   }
}