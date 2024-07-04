import express from "express";
import path from "path";
import videoRoutes from "./routes/VideoRoutes";
import { logger } from "./config/loggerConfig";

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/api/videos", videoRoutes);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error(`Unhandled error: ${err.stack}`);
    res.status(500).json({ error: "Internal server error" });
  },
);

export default app;
