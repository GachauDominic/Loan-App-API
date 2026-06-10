import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./http/error-handler.js";
import { notFoundHandler } from "./http/not-found.js";
import { routes } from "./routes.js";

export const app = express();

app.use(
  cors({
    origin: env.allowedOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "ujima-loaning-app",
    governance: "AIM/MAP/ETHOS/TRACK/OASIS/PRIDE/HORIZON"
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);
