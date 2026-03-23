import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RoundRobinState, RoundRobinDocument } from './schemas/round-robin.schema';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class RoundRobinService {
  constructor(
    @InjectModel(RoundRobinState.name)
    private rrModel: Model<RoundRobinDocument>,
    private usersService: UsersService,
  ) {}

  async assignAgent() {
    //  Get eligible agents
    const agents = await this.usersService.getAvailableAgents();

    if (!agents.length) return null;

    //  Get state
    let state = await this.rrModel.findById('ROUND_ROBIN_STATE');

    if (!state) {
      state = await this.rrModel.create({
        _id: 'ROUND_ROBIN_STATE',
        lastAssignedAgentIndex: 0,
      });
    }

    //  Select agent
    const index = state.lastAssignedAgentIndex % agents.length;
    const selectedAgent = agents[index];

    // Update pointer
    state.lastAssignedAgentIndex = (index + 1) % agents.length;
    await state.save();

    // Increment agent load
    selectedAgent.currentActiveCount += 1;
    await selectedAgent.save();

    return selectedAgent;
  }
}