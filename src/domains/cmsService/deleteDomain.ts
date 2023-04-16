import Config from "../../config";
import { Route53 } from "../../infrastructure/aws";

export async function deleteDomain({ subdomain }: { subdomain: string }) {
  try {
    const route53 = new Route53();
    await route53.deleteARecord(`${subdomain}.${Config.SERVER_URL}`);
  } catch (error) {
    throw error;
  }
}
