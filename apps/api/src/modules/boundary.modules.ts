import { Module, type Provider } from "@nestjs/common";
import { getModuleBoundary, type ModuleName } from "@elibrary/domain";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";

function boundaryProvider(name: ModuleName): Provider {
  return {
    provide: `${name.toUpperCase()}_MODULE_BOUNDARY`,
    useValue: getModuleBoundary(name)
  };
}

@Module({ controllers: [AuthController], providers: [boundaryProvider("Auth"), AuthService] })
export class AuthModule {}

@Module({ providers: [boundaryProvider("User")] })
export class UserModule {}

@Module({ providers: [boundaryProvider("Library")] })
export class LibraryModule {}

@Module({ providers: [boundaryProvider("Ebook")] })
export class EbookModule {}

@Module({ providers: [boundaryProvider("Holding")] })
export class HoldingModule {}

@Module({ providers: [boundaryProvider("Loan")] })
export class LoanModule {}

@Module({ providers: [boundaryProvider("Notification")] })
export class NotificationModule {}

@Module({ providers: [boundaryProvider("Admin")] })
export class AdminModule {}

@Module({ providers: [boundaryProvider("Integration")] })
export class IntegrationModule {}

@Module({ providers: [boundaryProvider("Audit")] })
export class AuditModule {}
