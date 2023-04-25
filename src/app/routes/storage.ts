import { Router } from "express";
import Joi from "joi";
import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";

import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../middlewares/validateRequest";
import { container } from "../../domains/@config/di.config";
import { ProjectService } from "../../domains/projectService";
import { TokenClient } from "../../infrastructure/jwtTokenClient";
import Config from "../../config";

export const storageRouter = Router();

storageRouter.use(
  "/:schemaName",
  validateRequest(
    Joi.object({
      schemaName: Joi.string().required(),
    }),
    "params",
  ),
);

storageRouter.use(
  asyncHandler(async (req, res, next) => {
    const storageKey = req.headers.authorization?.replace("Bearer ", "") ?? "";
    const tokenClient = container.get<TokenClient>("JwtTokenClient");

    const payload = tokenClient.validateToken({
      token: storageKey,
      key: Config.STORAGE_JWT_SECRET,
    });

    if (!payload) {
      return res.status(401).json({
        message: "not authorized",
      });
    }

    req.app.locals.projectName = payload.projectName;

    next();
  }),
);

storageRouter.post(
  "/:schemaName/contents",
  asyncHandler(async (req, res, next) => {
    const { schemaName } = req.params;
    const { projectName } = req.app.locals;
    const projectService = container.get<ProjectService>("ProjectService");

    const contents = await projectService.createContents({
      projectName,
      schemaName,
      contents: req.body,
    });

    return res.status(201).json({
      message: "ok",
      result: contents,
    });
  }),
);

storageRouter.get(
  "/:schemaName/contents",
  asyncHandler(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schemaName } = req.params;
    const { page, pageLength, sort, order } = req.query;
    const projectService = container.get<ProjectService>("ProjectService");

    const pagination = {
      ...(page && { page: Number(page) }),
      ...(pageLength && { pageLength: Number(pageLength) }),
    };

    let sortOptions: {
      [key: string]: string;
    }[] = [];

    if (Array.isArray(sort)) {
      if (Array.isArray(order)) {
        sortOptions = sort
          .map((sort, index) => {
            if (typeof sort !== "string") {
              return {};
            }

            const orderOption = (
              typeof order[index] === "string" ? order[index] : "asc"
            ) as string;

            return { [sort]: orderOption };
          })
          .filter(option => !isEmpty(option));
      } else if (typeof order === "string") {
        sortOptions = sort
          .map((sort, index) => {
            if (typeof sort !== "string") {
              return {};
            }

            return index === 0 ? { [sort]: order } : { [sort]: "asc" };
          })
          .filter(option => !isEmpty(option));
      } else if (!order) {
        sortOptions = sort
          .map(sort => {
            if (typeof sort !== "string") {
              return {};
            }

            return { [sort]: "asc" };
          })
          .filter(option => !isEmpty(option));
      }
    } else if (typeof sort === "string") {
      if (Array.isArray(order) && typeof order[0] === "string") {
        sortOptions = [{ [sort]: order[0] }];
      } else if (typeof order === "string") {
        sortOptions = [{ [sort]: order }];
      } else if (!order) {
        sortOptions = [{ [sort]: "asc" }];
      }
    }

    const contents = await projectService.getContents({
      projectName,
      schemaName,
      pagination,
      sort: sortOptions,
    });

    return res.status(200).json({
      message: "ok",
      result: contents,
    });
  }),
);

storageRouter.get(
  "/:schemaName/contents/:contentsId",
  asyncHandler(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schemaName, contentsId } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");

    const contents = await projectService.getContents({
      projectName,
      schemaName,
      // TODO: change logic.
      filter: { _id: new ObjectId(contentsId) },
    });

    return res.status(200).json({
      message: "ok",
      result: contents[0],
    });
  }),
);

storageRouter.put(
  "/:schemaName/contents/:contentsId",
  asyncHandler(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schemaName, contentsId } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");

    await projectService.updateContents({
      projectName,
      schemaName,
      contentsId,
      contents: req.body,
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

storageRouter.delete(
  "/:schemaName/contents/:contentsId",
  asyncHandler(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schemaName, contentsId } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");

    await projectService.deleteContents({
      projectName,
      schemaName: schemaName as string,
      contentsIds: [contentsId as string],
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

storageRouter.delete(
  "/:schemaName/contents",
  asyncHandler(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schemaName } = req.params;
    const { contentsId } = req.query;
    const projectService = container.get<ProjectService>("ProjectService");

    await projectService.deleteContents({
      projectName,
      schemaName: schemaName as string,
      contentsIds: Array.isArray(contentsId)
        ? (contentsId as string[])
        : [contentsId as string],
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);
