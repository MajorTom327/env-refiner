import { BaseSource } from "./BaseSource";
import fs from "fs";
import { complement, compose, find, isNil, pathOr, when } from "rambda";
import { parse } from "yaml";
import zod from "zod";

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
  fileContent: DockerCompose;

  constructor() {
    this.load();
  }

  get(key: string): string | undefined {
    const [service, env] = key.split(".");

    // @ts-expect-error bad types definitions
    const serviceEnv = compose(
      when(complement(isNil), (env: string) => env.split("=")[1]),
      find((el: string) => el.startsWith(`${env}=`)),
      pathOr([] as string[], ["services", service, "environment"])
    )(this.fileContent);

    return serviceEnv;
  }

  load(): void {
    const fileContent = fs.readFileSync("docker-compose.yml", "utf-8");

    const data = parse(fileContent);
    const dockerComposer = dockerComposeSchema.parse(data);
    this.fileContent = dockerComposer;
  }
}
