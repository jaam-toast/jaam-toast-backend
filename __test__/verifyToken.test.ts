import { jest } from "@jest/globals";
import { Request, Response, NextFunction, Send } from "express";

import createError from "http-errors";

import verifyToken from "../src/api/middlewares/verifyToken";

describe("Testing verifyToken middleware unit test", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNextFunc: NextFunction = jest.fn();

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      json: jest.fn() as Response["json"],
    };
  });

  describe('with "authorization" header', () => {
    test("mockNextFunc toBeCalledTimes 1", async () => {
      mockReq = {
        headers: {
          authorization: "Bearer test",
        },
      };
      verifyToken(mockReq as Request, mockRes as Response, mockNextFunc);

      expect(mockNextFunc).toBeCalledTimes(1);
    });
  });

  describe('without "authorization" header', () => {
    test("mockNextFunc toBeCalledWith createError(401)", async () => {
      mockReq = {
        headers: {},
      };

      verifyToken(mockReq as Request, mockRes as Response, mockNextFunc);

      expect(mockNextFunc).toBeCalledWith(createError(401));
    });
  });
});
