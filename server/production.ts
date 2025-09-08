import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { connectDB } from "./db";
import { setupAuth } from "./auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Setup authentication
    console.log('🔐 Setting up authentication...');
    await setupAuth(app);
    console.log('✅ Authentication setup complete');
    
    // Register routes
    console.log('🛣️ Registering routes...');
    const server = await registerRoutes(app);
    console.log('✅ Routes registered successfully');

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('❌ Server error:', err);
      res.status(status).json({ message });
    });

    // Serve static files in production
    console.log('📁 Setting up static file serving...');
    serveStatic(app);
    console.log('✅ Static file serving configured');

    // Start server
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    server.listen({
      port,
      host,
    }, () => {
      console.log(`🚀 Server running on ${host}:${port} in ${process.env.NODE_ENV} mode`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️ MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
      console.log(`🔑 Session Secret: ${process.env.SESSION_SECRET ? 'Set' : 'Not set'}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
