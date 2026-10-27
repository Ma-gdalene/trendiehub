if (typeof process.loadEnvFile === "function") {
  try { process.loadEnvFile(".env"); } catch {}
  try { process.loadEnvFile("../../.env"); } catch {}
}

import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type", "apikey", "X-Client-Info", "Prefer"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD", "PUT"],
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use(router);

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const failure = error as { code?: string; message?: string };
  const code = failure?.code ?? "";
  const status =
    code === "42501" ? 403 :
    code === "P0002" ? 404 :
    code === "23505" ? 409 :
    code.startsWith("22") || code.startsWith("23") ? 400 :
    500;

  req.log.error({ code: code || "UNEXPECTED" }, "API request failed");
  const message =
    status === 403 ? "You do not have permission to perform this action." :
    status === 404 ? "The requested record was not found." :
    status === 409 ? "This action conflicts with the current record state." :
    status === 400 ? "The request could not be processed." :
    "An unexpected server error occurred.";
  res.status(status).json({ error: message });
});

export default app;
