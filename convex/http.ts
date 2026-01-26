import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

const http = httpRouter();

// Register Better Auth routes with CORS enabled for client-side access
authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [siteUrl, "http://localhost:3000"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

export default http;
