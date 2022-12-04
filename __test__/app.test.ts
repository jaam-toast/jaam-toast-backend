import request from "supertest";

import mongoose from "mongoose";

import Config from "../src/config";
import app from "../src/app";

import Logger from "../src/loaders/logger";

beforeAll(async () => {
  await mongoose.connect(Config.DATABASE_URL as string);
});

afterAll(async () => {
  await mongoose.connection.close();
  Logger.info("❎ MongoDB disconnected!");
});

describe("Testing ping status", () => {
  describe("[GET] /status", () => {
    test("response statusCode 200", async () => {
      const response = await request(app).get("/status");

      expect(response.statusCode).toBe(200);
    });
  });

  describe("[HEAD] /status", () => {
    test("response statusCode 200", async () => {
      const response = await request(app).head("/status");

      expect(response.statusCode).toBe(200);
    });
  });
});
