import { ArgumentsHost, Catch, type ExceptionFilter } from "@nestjs/common";
import { SafeApiError } from "@elibrary/domain";

interface HttpResponse {
  status(code: number): {
    json(body: Record<string, unknown>): void;
  };
}

@Catch(SafeApiError)
export class SafeApiErrorFilter implements ExceptionFilter {
  catch(exception: SafeApiError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    response.status(exception.statusCode).json({ error: exception.publicMessage });
  }
}
