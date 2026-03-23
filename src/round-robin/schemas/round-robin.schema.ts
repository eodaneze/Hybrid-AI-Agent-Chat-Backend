import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoundRobinDocument = RoundRobinState & Document;

@Schema({ timestamps: true })
export class RoundRobinState {
  @Prop({ default: 'ROUND_ROBIN_STATE' })
  _id: string;

  @Prop({ default: 0 })
  lastAssignedAgentIndex: number;
}

export const RoundRobinSchema =
  SchemaFactory.createForClass(RoundRobinState);