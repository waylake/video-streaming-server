import { Request, Response } from "express";
import { VideoService } from "../services/VideoService";
import { logger } from "../config/loggerConfig";

export class VideoController {
  private videoService: VideoService;

  constructor() {
    this.videoService = new VideoService();
    this.uploadVideo = this.uploadVideo.bind(this);
    this.streamHLS = this.streamHLS.bind(this);
  }

  public async uploadVideo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      const objectName = await this.videoService.uploadVideo(req.file);
      res.status(200).json({
        message: "Video uploaded and converted to HLS successfully",
        objectName,
      });
    } catch (error) {
      logger.error(`Error in uploadVideo controller: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public async streamHLS(req: Request, res: Response): Promise<void> {
    try {
      const { objectName, filename } = req.params;
      logger.info(`Requested HLS file: hls/${objectName}/${filename}`);
      const stream = await this.videoService.getHLSStream(objectName, filename);

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("X-Content-Type-Options", "nosniff");

      stream.pipe(res);
    } catch (error) {
      logger.error(`Error in streamHLS controller: ${error}`);
      res.status(500).json({ error: "Internal server error", details: error });
    }
  }
}
