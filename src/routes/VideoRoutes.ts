import { Router } from "express";
import multer from "multer";
import { VideoController } from "../controllers/VideoController";

const router = Router();
const videoController = new VideoController();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  upload.single("video"),
  videoController.uploadVideo.bind(videoController),
);

router.get(
  "/hls/:objectName/:filename",
  videoController.streamHLS.bind(videoController),
);

export default router;
