const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import Supabase configuration and test connection
const { testConnection } = require("./config/supabase");

// Middleware
app.use(helmet());
app.use(morgan("combined"));

// CORS configuration - allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  process.env.FRONTEND_URL_ALT || "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://go-save-backend-six.vercel.app",
];

// Add production frontend URL if it exists
if (process.env.FRONTEND_URL_PRODUCTION) {
  allowedOrigins.push(process.env.FRONTEND_URL_PRODUCTION);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // In production, be more flexible with vercel.app domains
        if (origin && origin.includes('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Serve static files for testing
app.use("/test", express.static(path.join(__dirname, "public")));

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to GoSave API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth",
      deals: "/api/v1/deals",
      partners: "/api/v1/partners",
      analytics: "/api/v1/analytics",
    },
  });
});

// Basic health check route (define before other routes)
app.get("/api/v1/health", (req, res) => {
  res.json({
    message: "GoSave API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Import routes
const apiRoutes = require("./routes/api/v1");

// Routes
app.use("/api/v1", apiRoutes);

// 404 handler - Express v5 compatible
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Start server (only when not in Vercel serverless environment)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    console.log(`🚀 GoSave API server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/v1/health`);

    // Test Supabase connection on startup
    console.log("\n🔍 Testing Supabase connection...");
    await testConnection();
  });
}

// Export the Express app for Vercel serverless
module.exports = app;
