import multer from "multer";

import type { RequestHandler } from "express";

export const handleFormData = (formName: string): RequestHandler =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "assetUploads/");
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * 100,
    },
  }).array(formName);
