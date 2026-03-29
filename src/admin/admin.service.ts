import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from '../conversations/schemas/conversation.schema';
import { Message } from '../messages/schemas/message.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(Message.name)
    private messageModel: Model<Message>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  //SYSTEM OVERVIEW
  async getOverview() {
    const [
      totalUsers,
      totalAgents,
      totalConversations,
      activeConversations,
      resolvedConversations,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: 'user' }),
      this.userModel.countDocuments({ role: 'agent' }),
      this.conversationModel.countDocuments(),
      this.conversationModel.countDocuments({ status: 'ASSIGNED' }),
      this.conversationModel.countDocuments({ status: 'RESOLVED' }),
    ]);

    return {
      totalUsers,
      totalAgents,
      totalConversations,
      activeConversations,
      resolvedConversations,
    };
  }

  // AGENTS + LOAD
  async getAgents() {
    return this.userModel.find({ role: 'agent' }).select('-password');
  }

  // ALL CONVERSATIONS (with optional filters)
  async getConversations(query: any) {
    const filter: any = {};

    if (query.status) filter.status = query.status;
    if (query.agentId) filter.assignedAgentId = query.agentId;
    if (query.subAgentId) filter.subAgents = query.subAgentId;

    return this.conversationModel
      .find(filter)
      .populate('userId', 'name email')
      .populate('assignedAgentId', 'name email')
      .populate('subAgents', 'name email')
      .sort({ createdAt: -1 });
  }

  // SINGLE CONVERSATION DETAILS
  async getConversationDetails(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('userId', 'name email')
      .populate('assignedAgentId', 'name email');

    const messages = await this.messageModel
      .find({ conversationId })
      .sort({ createdAt: 1 });

    return {
      conversation,
      messages,
    };
  }
}