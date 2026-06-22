import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./prisma/client.js";

async function bootstrap() {
  await prisma.$connect();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Backend is running on http://localhost:${env.port}`);
  });
}

bootstrap().catch(async (error) => {
  console.error("Failed to start backend:", error);
  await prisma.$disconnect();
  process.exit(1);
});
