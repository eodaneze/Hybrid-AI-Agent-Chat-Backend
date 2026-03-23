import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Model, Types } from 'mongoose';
import { RoundRobinService } from '../round-robin/round-robin.service';
import { ConversationStatus } from './schemas/conversation.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    private roundRobinService: RoundRobinService,
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

   async escalateConversation(conversationId: string) {
        const convo = await this.conversationModel.findById(conversationId);

        if (!convo) throw new Error('Conversation not found');

        const agent = await this.roundRobinService.assignAgent();

        if (!agent) {
            convo.status = ConversationStatus.ESCALATED;
            await convo.save();
            return { message: 'No agents available' };
        }

        convo.assignedAgentId = agent._id;
        convo.status = ConversationStatus.ASSIGNED;
        convo.assignedAt = new Date();

        await convo.save();

        return convo;
    }
}