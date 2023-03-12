import ProjectService from ".";
import describeInstanceIp from "../../services/deploy/aws/ec2_describeinstances";

const waitPublicIpAdreessCreation = async (service: ProjectService, next: Function) => {
  const { instanceId } = service;

  if (!instanceId) {
    // to Be
    return;
  }

  service.debug("Creating instance public IP...");

  const publicIpAddressInterval = setInterval(async () => {
    const instanceChangeInfo = await describeInstanceIp(instanceId);

    if (!instanceChangeInfo?.publicIpAddress) {
      return;
    }

    service.debug(`Created instance public IP: ${instanceChangeInfo.publicIpAddress}`);

    service.publicIpAddress = instanceChangeInfo.publicIpAddress;

    clearInterval(publicIpAddressInterval);
    next();
  }, 2000);
};

export default waitPublicIpAdreessCreation;
