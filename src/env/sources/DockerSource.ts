import { BaseSource } from "./BaseSource";
import * as fs from "fs";
import { complement, compose, find, isNil, pathOr, when } from "rambda";
import { parse } from "yaml";
import * as zod from "zod";

const dockerComposeSchema = zod.object({
  version: zod.string(),
  services: zod.record(
    zod.object({
      image: zod.string(),
      environment: zod.array(zod.string()),
    })
  ),
});

type DockerCompose = zod.infer<typeof dockerComposeSchema>;

export class DockerSource implements BaseSource {
  // @ts-ignore
  fileContent: DockerCompose;

  constructor() {
    this.load();
  }

  get(key: string): string | undefined {
    const [service, env] = key.split(".");

    // @ts-ignore bad types definitions
    const serviceEnv = compose(
      when(complement(isNil), (env: string) => env.split("=")[1]),
      find((el: string) => el.startsWith(`${env}=`)),
      pathOr([] as string[], ["services", service, "environment"])
    )(this.fileContent);

    return serviceEnv;
  }

  load(): void {
    if (!fs.existsSync("docker-compose.yml")) {
      throw new Error("docker-compose.yml not found");
    }
    const fileContent = fs.readFileSync("docker-compose.yml", "utf-8");

    const data = parse(fileContent);
    const dockerComposer = dockerComposeSchema.parse(data);
    this.fileContent = dockerComposer;
  }
}
