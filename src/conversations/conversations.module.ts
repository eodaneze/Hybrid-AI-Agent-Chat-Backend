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
import { ChatGateway } from 'src/chat/chat.gateway';
import { MessagesModule } from 'src/messages/messages.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    RoundRobinModule, 
    UsersModule,
    MessagesModule,

    JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_SECRET') as string,
            signOptions: {
              expiresIn: config.get<StringValue>('JWT_EXPIRES_IN'), 
            },
          }),
        }),
  ],
  providers: [ConversationsService, ChatGateway],
  controllers: [ConversationsController],
  exports: [ConversationsService],
})
export class ConversationsModule {}