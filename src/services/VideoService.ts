import * as Minio from "minio";
import { envConfig } from "../config/envConfig";
import { logger } from "../config/loggerConfig";
import { Readable } from "stream";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);

export class VideoService {
  private minioClient: Minio.Client;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: envConfig.minioEndpoint,
      port: envConfig.minioPort,
      useSSL: false,
      accessKey: envConfig.minioAccessKey,
      secretKey: envConfig.minioSecretKey,
    });
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    const objectName = `${Date.now()}-${file.originalname}`;
    try {
      const metaData = {
        "Content-Type": file.mimetype,
      };
      await this.minioClient.putObject(
        envConfig.minioBucketName,
        objectName,
        file.buffer,
        undefined,
        metaData,
      );
      logger.info(`Video uploaded successfully: ${objectName}`);
      logger.info(`Starting HLS conversion for: ${objectName}`);
      await this.convertToHLS(objectName);
      logger.info(`HLS conversion completed for: ${objectName}`);

      return objectName;
    } catch (error) {
      logger.error(`Error uploading video: ${error}`);
      throw error;
    }
  }

  async convertToHLS(objectName: string): Promise<void> {
    const inputPath = `./tmp/${objectName}`;
    const outputPath = `./tmp/hls/${objectName}`;

    try {
      logger.info(`Downloading file from MinIO: ${objectName}`);
      await this.minioClient.fGetObject(
        envConfig.minioBucketName,
        objectName,
        inputPath,
      );

      logger.info(`Creating output directory: ${outputPath}`);
      await fs.mkdir(outputPath, { recursive: true });

      logger.info(`Converting to HLS: ${objectName}`);
      await execAsync(
        `ffmpeg -i ${inputPath} -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${outputPath}/playlist.m3u8`,
      );

      logger.info(`Uploading HLS files to MinIO: ${objectName}`);
      const files = await fs.readdir(outputPath);
      for (const file of files) {
        await this.minioClient.fPutObject(
          envConfig.minioBucketName,
          `hls/${objectName}/${file}`,
          `${outputPath}/${file}`,
        );
        logger.info(`Uploaded HLS file: hls/${objectName}/${file}`);
      }

      logger.info(`Cleaning up temporary files: ${objectName}`);
      await fs.unlink(inputPath);
      await fs.rm(outputPath, { recursive: true });

      logger.info(`HLS conversion completed: ${objectName}`);
    } catch (error) {
      logger.error(`Error converting video to HLS: ${error}`);
      throw error;
    }
  }

  async getHLSStream(objectName: string, filename: string): Promise<Readable> {
    try {
      const filePath = `hls/${objectName}/${filename}`;

      const exists = await this.minioClient.statObject(
        envConfig.minioBucketName,
        filePath,
      );

      const stream = await this.minioClient.getObject(
        envConfig.minioBucketName,
        filePath,
      );
      return stream;
    } catch (error) {
      logger.error(`HLS file not found: ${objectName}/${filename}`);
      throw new Error("Video not found or not yet converted");
    }
  }
}
