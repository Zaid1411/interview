import app from './app.js';
import { config } from './config/index.js';
import prisma from './prisma.js';

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma');

    const server = app.listen(config.port, () => {
      console.log(`🚀 InterviewLab Server listening on http://localhost:${config.port}`);
      console.log(`⚡ Code Runner Provider: ${config.codeRunnerProvider}`);
    });

    const shutdown = async () => {
      console.log('\n🛑 Gracefully shutting down...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Database connection closed. Exited.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
