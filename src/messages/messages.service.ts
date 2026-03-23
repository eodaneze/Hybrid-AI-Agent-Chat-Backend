import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument, SenderType } from './schemas/message.schema';
import { Model, Types } from 'mongoose';
import { ForbiddenException } from '@nestjs/common';
import { ConversationStatus } from '../conversations/schemas/conversation.schema';
import { Conversation, ConversationDocument } from '../conversations/schemas/conversation.schema';


@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,

     @InjectModel(Conversation.name)
     private conversationModel: Model<ConversationDocument>,
  ) {}

  async createMessage(data: {
    conversationId: string;
    senderType: SenderType;
    senderId?: string;
    message: string;
  }) {
  const conversation = await this.conversationModel.findById(data.conversationId);

  if (!conversation) throw new Error('Conversation not found');

  const userId = data.senderId;

  // USER sending message
  if (data.senderType === SenderType.USER) {
    if (conversation.userId.toString() !== userId) {
      throw new ForbiddenException('You do not own this conversation');
    }
  }

  // AGENT sending message
  if (data.senderType === SenderType.AGENT) {
    if (
      !conversation.assignedAgentId ||
      conversation.assignedAgentId.toString() !== userId
    ) {
      throw new ForbiddenException('You are not assigned to this conversation');
    }
  }

  return this.messageModel.create({
    conversationId: new Types.ObjectId(data.conversationId),
    senderType: data.senderType,
    senderId: data.senderId
      ? new Types.ObjectId(data.senderId)
      : undefined,
    message: data.message,
  });
}

  async getMessages(conversationId: string) {
    return this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 });
  }
}