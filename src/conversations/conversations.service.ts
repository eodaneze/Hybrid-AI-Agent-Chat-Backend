import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  async createConversation(userId: string) {
    return this.conversationModel.create({
      userId: new Types.ObjectId(userId),
    });
  }

  async getUserConversations(userId: string) {
    console.log('Getting conversations for user:', userId);
    return this.conversationModel.find({ userId: new Types.ObjectId(userId) });
  }

  async getConversationById(id: string) {
    return this.conversationModel.findById(id);
  }
}