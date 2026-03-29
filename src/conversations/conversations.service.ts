import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Model, Types } from 'mongoose';
import { RoundRobinService } from '../round-robin/round-robin.service';
import { ConversationStatus } from './schemas/conversation.schema';
import { UsersService } from 'src/users/users.service';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    private chatGateway: ChatGateway,
    private roundRobinService: RoundRobinService,
    private userService: UsersService
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

        this.chatGateway.server
          .to(`user_${convo.assignedAgentId}`)
          .emit('newAssignment', {
            conversationId: convo._id,
            message: 'A new conversation has been assigned to you',
          });

        return convo;
    }

    async agentMarkResolved(conversationId: string, agentId: string) {
    const convo = await this.conversationModel.findById(conversationId);

    if (!convo) throw new Error('Conversation not found');

    // Only assigned agent can mark resolved
    if (!convo.assignedAgentId || convo.assignedAgentId.toString() !== agentId) {
        throw new ForbiddenException('You are not assigned to this conversation');
    }

    convo.agentResolved = true;
    convo.status = ConversationStatus.PENDING_USER_CONFIRMATION;
    await convo.save();

    return convo;
    }


    async userConfirmResolution(conversationId: string, userId: string, confirm: boolean) {
        const convo = await this.conversationModel.findById(conversationId);

        if (!convo) throw new Error('Conversation not found');

        if (convo.userId.toString() !== userId) {
            throw new ForbiddenException('You do not own this conversation');
        }

        if (confirm) {
            convo.userResolved = true;
            convo.status = ConversationStatus.RESOLVED;

            // Reduce agent load
            if (convo.assignedAgentId) {
            const agent = await this.userService.findById(convo.assignedAgentId.toString());
            if (agent && agent.currentActiveCount > 0) {
                agent.currentActiveCount -= 1;
                await agent.save();
            }
            }

        } else {
            convo.userResolved = false;
            convo.status = ConversationStatus.ASSIGNED;
        }

        await convo.save();

        return convo;
    }

  async addSubAgent(
      conversationId: string,
      agentId: string,
      currentUser: any
  ){
      const convo = await this.conversationModel.findById(conversationId);

      if(!convo) throw new Error('Conversation not found');

      const isMainAgent = convo.assignedAgentId && convo.assignedAgentId.toString() === currentUser;

      const isAdmin = currentUser.role === 'admin';

      if(!isMainAgent && !isAdmin){
          throw new ForbiddenException('Only main assigned agent or admin can add sub-agents')
      }

      if(convo.subAgents.some(
        (id) => id.toString() === agentId
      )){
         return { message: 'Agent already a sub-agent' }
      }

      convo.subAgents.push(new Types.ObjectId(agentId));
      await convo.save();

      this.chatGateway.server
         .to(`user_${agentId}`)
         .emit('addedToConversation', {
            conversationId: convo._id,
            message: 'You have been added as a sub-agent to a conversation'
         })

      return {message: 'Sub-agent added successfully'}
  }

    async getALlConversations(){
       return this.conversationModel
          .find()
          .populate('userId', 'name email')
          .populate('assignedAgentId', 'name email')
          .populate('subAgents', 'name email')
    }
}