import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import {
  AdminModule,
  AuditModule,
  AuthModule,
  EbookModule,
  HoldingModule,
  IntegrationModule,
  LibraryModule,
  LoanModule,
  NotificationModule,
  UserModule
} from "./modules/boundary.modules";

@Module({
  imports: [
    AuthModule,
    UserModule,
    LibraryModule,
    EbookModule,
    HoldingModule,
    LoanModule,
    NotificationModule,
    AdminModule,
    IntegrationModule,
    AuditModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
