import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { workerQueueNames } from "@elibrary/domain";

const redisPort = Number(process.env.REDIS_PORT ?? 6379);

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? "127.0.0.1",
        port: redisPort
      }
    }),
    BullModule.registerQueue(...workerQueueNames.map((name) => ({ name })))
  ]
})
export class WorkerModule {}
