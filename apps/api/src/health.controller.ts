import { Controller, Get } from "@nestjs/common";
import { moduleBoundaries, runtimeComponents } from "@elibrary/domain";

interface HealthResponse {
  readonly status: "ok";
  readonly runtime: "backend-api";
  readonly modules: readonly string[];
  readonly components: readonly string[];
}

@Controller("health")
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: "ok",
      runtime: "backend-api",
      modules: moduleBoundaries.map((boundary) => boundary.name),
      components: runtimeComponents.map((component) => component.name)
    };
  }
}
