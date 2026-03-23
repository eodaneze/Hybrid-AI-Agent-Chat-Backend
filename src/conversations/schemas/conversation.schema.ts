import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export enum ConversationStatus {
  AI_ACTIVE = 'AI_ACTIVE',
  ESCALATED = 'ESCALATED',
  ASSIGNED = 'ASSIGNED',
  PENDING_USER_CONFIRMATION = 'PENDING_USER_CONFIRMATION',
  RESOLVED = 'RESOLVED',
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedAgentId: Types.ObjectId | null;

  @Prop({
    type: String,
    enum: ConversationStatus,
    default: ConversationStatus.AI_ACTIVE,
  })
  status: ConversationStatus;

  @Prop({ default: false })
  agentResolved: boolean;

  @Prop({ default: false })
  userResolved: boolean;

  @Prop()
  escalatedAt: Date;

  @Prop()
  assignedAt: Date;

  @Prop()
  resolvedAt: Date;
}

export const ConversationSchema =
  SchemaFactory.createForClass(Conversation);