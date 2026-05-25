import http from "node:http";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { createSocketServer } from "./socket/socketServer.js";

async function bootstrap() {
  await connectDb(env.mongoUri);

  const app = createApp();
  const server = http.createServer(app);
  createSocketServer(server);

  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
 
 
