import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origensPermitidas = (
    process.env.CORS_ORIGINS ?? "http://localhost:3001"
  )
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

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
