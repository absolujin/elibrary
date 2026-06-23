import { moduleBoundaries, runtimeComponents } from "@elibrary/domain";

export function App(): React.ReactElement {
  const adminRuntime = runtimeComponents.find((component) => component.name === "admin-ui");
  const adminBoundary = moduleBoundaries.find((boundary) => boundary.name === "Admin");

  return (
    <main>
      <h1>eLibrary Admin</h1>
      <p>{adminRuntime?.responsibility}</p>
      <p>{adminBoundary?.responsibility}</p>
    </main>
  );
}
