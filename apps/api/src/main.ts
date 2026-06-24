import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SafeApiErrorFilter } from "./modules/security/safe-api-error.filter";

const port = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new SafeApiErrorFilter());
  await app.listen(port);
}

void bootstrap();
