import Config from "../../../config";

import catchAsync from "../../../utils/asyncHandler";
import { buildingLogSocket } from "../../../deploy/socket";

import { DeploymentError } from "../../../utils/errors";
import { createDeploymentDebug } from "../../../utils/createDebug";

const connectBuildingLogSocket = catchAsync(async (req, res, next) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  buildingLogSocket();

  debug(`Socket for building log is created.`);

  return res.status(204).json({
    result: "ok",
  });
});

export default connectBuildingLogSocket;
