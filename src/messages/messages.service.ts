import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument, SenderType } from './schemas/message.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(data: {
    conversationId: string;
    senderType: SenderType;
    senderId?: string;
    message: string;
  }) {
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