import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { createMetadataSyncJob, type MetadataSyncJobPayload } from "@elibrary/domain";

@Processor("metadata-sync")
export class MetadataSyncProcessor extends WorkerHost {
  async process(job: Job<MetadataSyncJobPayload>): Promise<MetadataSyncJobPayload> {
    return createMetadataSyncJob(job.data).payload;
  }
}
