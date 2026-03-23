import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { RoundRobinModule } from '../round-robin/round-robin.module'; 
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    RoundRobinModule, 
    UsersModule,
  ],
  providers: [ConversationsService],
  controllers: [ConversationsController],
  exports: [ConversationsService],
})
export class ConversationsModule {}