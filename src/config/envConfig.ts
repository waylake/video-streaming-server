import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
  NODE_ENV: process.env.node_env || "development",
  port: process.env.PORT || 3000,
  minioEndpoint: process.env.MINIO_ENDPOINT || "localhost",
  minioPort: parseInt(process.env.MINIO_PORT || "9000"),
  minioAccessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  minioSecretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  minioBucketName: process.env.MINIO_BUCKET_NAME || "videos",
};
