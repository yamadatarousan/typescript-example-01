import { buildApp } from "./server.js";

const app = buildApp();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

app
  .listen({ port })
  .then(() => {
    console.log(`Server running at http://localhost:${port}`);
  })
  .catch((error: unknown) => {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
  });
