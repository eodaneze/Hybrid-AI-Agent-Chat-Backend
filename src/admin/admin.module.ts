import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from 'src/conversations/schemas/conversation.schema';
import { Message, MessageSchema } from 'src/messages/schemas/message.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
     MongooseModule.forFeature([
        {name: Conversation.name, schema: ConversationSchema},
        {name: Message.name, schema: MessageSchema},
        {name: User.name, schema: UserSchema}
     ])
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
