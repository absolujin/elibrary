import { Injectable, type NestMiddleware } from "@nestjs/common";
import { invalidRequestMessage, SafeApiError, validateHttpRequestBoundary } from "@elibrary/domain";

interface BoundaryRequest {
  readonly method?: string;
  readonly headers: Readonly<Record<string, string | readonly string[] | undefined>>;
}

interface BoundaryResponse {
  status(code: number): {
    json(body: Record<string, unknown>): void;
  };
}

@Injectable()
export class HttpBoundaryMiddleware implements NestMiddleware {
  use(request: BoundaryRequest, response: BoundaryResponse, next: () => void): void {
    try {
      validateHttpRequestBoundary({
        method: request.method,
        headers: request.headers
      });
      next();
    } catch (error) {
      const statusCode = error instanceof SafeApiError ? error.statusCode : 400;
      response.status(statusCode).json({ error: invalidRequestMessage });
    }
  }
}
