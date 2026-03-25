import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessagesModule } from '../messages/messages.module';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms'; 

@Module({
  imports: [
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
})
export class ChatModule {}