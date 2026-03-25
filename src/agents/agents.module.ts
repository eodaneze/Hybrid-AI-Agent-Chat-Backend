import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from 'src/conversations/schemas/conversation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Conversation.name, schema: ConversationSchema}
    ])
  ],
  controllers: [AgentsController],
  providers: [AgentsService]
})
export class AgentsModule {}
