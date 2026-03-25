import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from '../conversations/schemas/conversation.schema';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}

  
  async getAssigned(agentId: string) {
   
    return this.conversationModel
      .find({ assignedAgentId: new Types.ObjectId(agentId) })
      .sort({ createdAt: -1 });
  }


  async getActive(agentId: string) {
    return this.conversationModel.find({
      assignedAgentId: new Types.ObjectId(agentId),
      status: 'ASSIGNED',
    });
  }

  
  async getPending(agentId: string) {
    return this.conversationModel.find({
      assignedAgentId: new Types.ObjectId(agentId),
      status: 'PENDING_USER_CONFIRMATION',
    });
  }


  async getStats(agentId: string) {
    const [active, pending, resolved] = await Promise.all([
      this.conversationModel.countDocuments({
        assignedAgentId: new Types.ObjectId(agentId),
        status: 'ASSIGNED',
      }),
      this.conversationModel.countDocuments({
        assignedAgentId: new Types.ObjectId(agentId),
        status: 'PENDING_USER_CONFIRMATION',
      }),
      this.conversationModel.countDocuments({
        assignedAgentId: new Types.ObjectId(agentId),
        status: 'RESOLVED',
      }),
    ]);

    return {
      active,
      pending,
      resolved,
    };
  }
}