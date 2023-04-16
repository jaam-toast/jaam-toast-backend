import Config from "../../config";
import { Route53 } from "../../infrastructure/aws";

export async function deleteDomain({ subdomain }: any) {
  const route53 = new Route53();
  await route53.deleteARecord(`${subdomain}.${Config.SERVER_URL}`);
}
