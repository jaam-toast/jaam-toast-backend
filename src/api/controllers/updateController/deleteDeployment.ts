import { startSession } from "mongoose";

import Config from "../../../config";
import catchAsync from "../../../utils/asyncHandler";

import terminateInstance from "../../../deploy/aws/ec2_terminateinstances";
import changeDNSRecord from "../../../deploy/aws/route53_changerecord";
import describeInstanceIp from "../../../deploy/aws/ec2_describeinstances";

import { User } from "../../../models/User";
import { Repo } from "../../../models/Repo";

import { RRType } from "@aws-sdk/client-route-53";
import deleteLogStream from "../../../deploy/aws/cwl_deletelogstream";

const deleteDeployment = catchAsync(async (req, res, next) => {
  const { githubAccessToken } = req.query;
  const { user_id, repo_id } = req.params;
  const { instanceId, repoName } = req.body;

  const debug = createGeneralLogDebug(Config.CLIENT_OPTIONS.debug);

  if (!githubAccessToken || !user_id || !repo_id || !instanceId || !repoName) {
    return next(
    );
  }

  const session = await startSession();

  await session.withTransaction(async () => {
    await User.updateOne({ _id: user_id }, { $pull: { myRepos: repo_id } });

    await Repo.findByIdAndDelete(repo_id);
  });

  session.endSession();

  await terminateInstance(instanceId);

  const instanceChangeInfo = await describeInstanceIp(instanceId);

  if (!instanceChangeInfo) {
    return next(
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
    );
  }

  await deleteLogStream(instanceId);

  return res.json({
    result: "ok",
  });
});

export default deleteDeployment;
