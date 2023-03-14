import { startSession } from "mongoose";

import Config from "../../config";
import catchAsync from "../../utils/asyncHandler";

import terminateInstance from "../../services/deploy/aws/ec2_terminateinstances";
import changeDNSRecord from "../../services/deploy/aws/route53_changerecord";
import describeInstanceIp from "../../services/deploy/aws/ec2_describeinstances";
import deleteLogStream from "../../services/deploy/aws/cwl_deletelogstream";

import { User } from "../../models/User";
import { Repo } from "../../models/Repo";

import { CustomError } from "../../utils/errors";
import { createGeneralLogDebug } from "../../utils/createDebug";

import { RRType } from "@aws-sdk/client-route-53";

const deleteDeployment = catchAsync(async (req, res, next) => {
  const { githubAccessToken } = req.query;
  const { user_id, repo_id } = req.params;
  const { instanceId, repoName, repoOwner, webhookId } = req.body;

  const debug = createGeneralLogDebug(Config.CLIENT_OPTIONS.debug);

  if (!githubAccessToken || !user_id || !repo_id || !instanceId || !repoName) {
    debug(
      "Error: 'githubAccessToken', 'user_id', 'repo_id', 'instanceId', and 'repoName' are expected to be strings",
    );

    return next(
      new CustomError({
        code: "400: deleteDeployment",
        message:
          "Error: 'githubAccessToken', 'user_id', 'repo_id', 'instanceId', and 'repoName' are typeof undefined",
      }),
    );
  }

  const session = await startSession();

  await session.withTransaction(async () => {
    await User.updateOne({ _id: user_id }, { $pull: { myRepos: repo_id } });

    await Repo.findByIdAndDelete(repo_id);
  });

  session.endSession();

  debug(
    `Successfully deleted the deployment data from database - ${instanceId}`,
  );

  await deleteLogStream(instanceId);

  debug(`Successfully deleted a user-data.log of ${instanceId}`);

  const instanceChangeInfo = await describeInstanceIp(instanceId);

  if (!instanceChangeInfo) {
    return next(
      new CustomError({
        code: "401: deleteDeployment_describeInstanceIp",
        message:
          "Error: 'instanceChangeInfo.publicIpAddress' is typeof undefined",
      }),
    );
  }

  const publicIpAddress = instanceChangeInfo.publicIpAddress;
  const changeDNSRecordInput = {
    actionType: "DELETE",
    subdomain: repoName as string,
    recordValue: publicIpAddress as string,
    recordType: RRType.A,
  };

  const recordChangeInfo = await changeDNSRecord(changeDNSRecordInput);

  if (!recordChangeInfo) {
    return next(
      new CustomError({
        code: "401: deleteDeployment_changeDNSRecord",
        message: "Error: 'recordChangeInfo.recordId' is typeof undefined",
      }),
    );
  }

  debug(
    `Successfully deleted a record (${recordChangeInfo.recordId}) of ${instanceId}`,
  );

  await terminateInstance(instanceId);

  debug(`Successfully deleted an instance - ${instanceId}`);

  return res.json({
    result: "ok",
  });
});

export default deleteDeployment;
