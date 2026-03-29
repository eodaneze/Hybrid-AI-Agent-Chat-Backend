import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessagesModule } from '../messages/messages.module';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms'; 
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from 'src/conversations/schemas/conversation.schema';

@Module({
  imports: [
      MongooseModule.forFeature([
           { name: Conversation.name, schema: ConversationSchema },
      ]),
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
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}