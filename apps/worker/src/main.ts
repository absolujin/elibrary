import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { workerQueueNames } from "@elibrary/domain";
import { WorkerModule } from "./worker.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  const logger = new Logger("WorkerRuntime");
  logger.log(`Worker runtime registered queues: ${workerQueueNames.join(", ")}`);

  process.on("SIGTERM", () => {
    void app.close();
  });
}

void bootstrap();
