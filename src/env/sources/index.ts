import { BaseSource } from "./BaseSource";
import { DateSource } from "./DateSource";
import { DockerSource } from "./DockerSource";
import { EnvSource } from "./EnvSource";
import { UuidSource } from "./UuidSource";

export { EnvSource } from "./EnvSource";

export enum SourceEnum {
  env = "env",
  docker = "docker",
  uuid = "uuid",
  date = "date",
}

export type Source = keyof typeof SourceEnum;
/**
 * Here we define a mapping of source to be used
 * in the parsing of each line of the env files
 */
const mapping: Record<Source, () => BaseSource> = {
  env: () => new EnvSource(),
  docker: () => new DockerSource(),
  uuid: () => new UuidSource(),
  date: () => new DateSource(),
};

export default mapping;
