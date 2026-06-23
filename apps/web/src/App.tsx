import { runtimeComponents } from "@elibrary/domain";

export function App(): React.ReactElement {
  const webRuntime = runtimeComponents.find((component) => component.name === "web-app");

  return (
    <main>
      <h1>eLibrary</h1>
      <p>{webRuntime?.responsibility}</p>
    </main>
  );
}
