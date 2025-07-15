const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Import routes
const deploymentRoutes = require('./routes/deployments');
const agentRoutes = require('./routes/agents');
const voiceRoutes = require('./routes/voices');
const agentSyncRoutes = require('./routes/agentSync');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Compression middleware (gzip)
if (process.env.ENABLE_COMPRESSION !== 'false') {
  app.use(compression());
}

// Logging middleware
if (isProduction) {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable if causing issues with your app
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Default allowed origins
    const defaultAllowedOrigins = [
      'https://agent-command-center.netlify.app',
      'http://localhost:3000'
    ];
    
    // Merge with environment variable origins if provided
    const envOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
    const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envOrigins])];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (for accurate IP addresses behind reverse proxies)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  try {
    // You can add database connectivity checks here
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      services: {
        database: 'connected', // Add actual DB check
        external_apis: 'available' // Add actual API checks
      }
    };
    
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// API version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: process.env.npm_package_version || '1.0.0',
    api_version: 'v1',
    environment: NODE_ENV
  });
});

// API routes
app.use('/api/deployments', deploymentRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/voices', voiceRoutes);
app.use('/api/agent-sync', agentSyncRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details
  const errorId = Date.now().toString(36);
  const errorDetails = {
    id: errorId,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  };
  
  // Log full error in production
  if (isProduction) {
    console.error('Error ID:', errorId, errorDetails);
  } else {
    console.error(err.stack);
  }
  
  // Don't leak error details in production
  const message = isProduction 
    ? 'An error occurred processing your request' 
    : err.message;
  
  res.status(err.status || 500).json({
    error: {
      message,
      status: err.status || 500,
      ...(isProduction ? { id: errorId } : { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: { 
      message: 'Not found', 
      status: 404,
      path: req.path 
    } 
  });
});

// Graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`Agent Command Center backend running on port ${PORT} in ${NODE_ENV} mode`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});