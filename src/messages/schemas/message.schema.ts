import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum SenderType {
  USER = 'USER',
  AGENT = 'AGENT',
  AI = 'AI',
  SYSTEM = 'SYSTEM'
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: false,
  })
  senderType?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, default: {} })
  metadata: {
    confidenceScore?: number;
    intent?: string;
  };
}

export const MessageSchema = SchemaFactory.createForClass(Message);