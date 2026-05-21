require('./dnsSet');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const config = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { initBackupSystem } = require('./config/backup');
const { startProactiveAlerts } = require('./services/aiSchedulerService');
const maintenanceCheck = require('./middleware/maintenance');
const webhookRoutes = require('./routes/public/webhookRoutes');
const mainRoutes = require('./routes');

const app = express();

// Ensure required directories exist
const dirs = [
  path.resolve(__dirname, 'logs'),
  path.resolve(__dirname, 'backups'),
  path.resolve(__dirname, 'backups', 'system'),
  path.resolve(__dirname, 'backups', 'tenants')
];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
});

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: [
    config.clientUrl,
    config.adminUrl,
    config.landingUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use('/api/webhooks', webhookRoutes);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Maintenance mode — blocks public & tenant, allows admin
app.use(maintenanceCheck);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Smart Burner Green Console
const green = '\x1b[32m';
const reset = '\x1b[0m';
const bold = '\x1b[1m';
console.log(`${green}${bold}`);
console.log('╔══════════════════════════════════════════════╗');
console.log('║                                              ║');
console.log('║           HDM ERP — SERVER ONLINE            ║');
console.log('║          Smart Business Management           ║');
console.log('║                                              ║');
console.log('╚══════════════════════════════════════════════╝');
console.log(`${reset}`);

// JSON endpoints at root
app.get('/', (req, res) => {
  res.json({ success: true, name: 'HDM ERP API', version: '1.0.0', environment: config.nodeEnv, timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ success: true, name: 'HDM ERP API', version: '1.0.0', docs: '/api/public', health: '/health', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', mainRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, _next) => {
  logger.error(`Unhandled error: ${err.message}\n${err.stack}`);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const startServer = async () => {
  logger.info('Starting HDM ERP server...');
  await connectDB();

  try { await initBackupSystem(); logger.info('Backup system ready'); } catch (err) { logger.warn('Backup init failed:', err.message); }
  try { startProactiveAlerts(); logger.info('Proactive alerts started'); } catch (err) { logger.warn('Alerts init failed:', err.message); }

  const server = app.listen(config.port, () => {
    console.log(`${green}${bold}➜ Server running on port ${config.port} [${config.nodeEnv}]${reset}`);
    logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    console.log(`\n${green}${bold}➜ Received ${signal}. Shutting down gracefully...${reset}`);
    server.close(async () => {
      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('MongoDB disconnected');
        console.log(`${green}${bold}➜ MongoDB disconnected${reset}`);
      } catch (err) {
        logger.error('Error disconnecting MongoDB:', err.message);
      }
      logger.info('Server closed');
      console.log(`${green}${bold}➜ Server closed${reset}`);
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();

module.exports = app;