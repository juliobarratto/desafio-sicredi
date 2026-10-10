import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const origensPermitidas = configService
    .getOrThrow<string>("CORS_ORIGINS")
    .split(",")
    .map((origem) => origem.trim());

  app.enableCors({
    origin: origensPermitidas,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();
  await app.listen(configService.getOrThrow<number>("PORT"));
}
void bootstrap();
