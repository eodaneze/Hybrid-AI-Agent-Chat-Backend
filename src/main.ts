import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);

  app.useGlobalGuards(
    new JwtAuthGuard(reflector)
  )

  const config = new DocumentBuilder()
    .setTitle('AI Agent Chat System')
    .setDescription('Hybrid AI + Agent Chat Backend')
    .setVersion('1.0')
    .addBearerAuth({type: 'http'}, 'jwt')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document)
     
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
