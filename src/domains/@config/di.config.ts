import { Container } from "inversify";
import "reflect-metadata";

import { ProjectRepository } from "../../repositories/projectRepository";
import { ProjectService } from "../projectService";
import { BuildService, IBuildService } from "../buildService";
import { CmsService, ICmsService } from "../cmsService";
import { IProjectRepository } from "../../repositories/projectRepository";
import {
  IUserRepository,
  UserRepository,
} from "../../repositories/userRepository";
import { UserService } from "../userService";
import {
  ContentsClient,
  mongodbContentsClient,
} from "../../infrastructure/mongodbContentsClient";
import { TokenClient, jwtTokenClient } from "src/infrastructure/jwtTokenClient";

/**
 * 의존성 등록 - identifier(ex "ProjectService" 등 string으로 입력된 곳)를 to("등록할 곳")에 등록합니다.
 *
 */
const container = new Container();

container.bind<ProjectService>("ProjectService").to(ProjectService);
container.bind<IBuildService>("BuildService").to(BuildService);
container.bind<ICmsService>("CmsService").to(CmsService);
container.bind<UserService>("UserService").to(UserService);
container.bind<IProjectRepository>("ProjectRepository").to(ProjectRepository);
container.bind<IUserRepository>("UserRepository").to(UserRepository);
container
  .bind<ContentsClient>("MongoDBContentsClient")
  .to(mongodbContentsClient);
container.bind<TokenClient>("JwtTokenClient").to(jwtTokenClient);

export { container };
