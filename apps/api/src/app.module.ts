import { MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
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
import { HttpBoundaryMiddleware } from "./modules/security/http-boundary.middleware";

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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpBoundaryMiddleware).forRoutes("*");
  }
}
