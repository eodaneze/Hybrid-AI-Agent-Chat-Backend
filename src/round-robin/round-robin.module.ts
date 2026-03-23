import { Module } from '@nestjs/common';
import { RoundRobinService } from './round-robin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoundRobinSchema, RoundRobinState } from './schemas/round-robin.schema';
import { UsersModule } from 'src/users/users.module';


@Module({
  imports: [
     MongooseModule.forFeature([
      { name: RoundRobinState.name, schema: RoundRobinSchema },
    ]),

    UsersModule,
  ],
  providers: [RoundRobinService],
  exports: [RoundRobinService],
})
export class RoundRobinModule {}
