import { isEmpty, isNil, prop } from "rambda";
import { BaseSource } from "./BaseSource";

export class EnvSource implements BaseSource {
  static _env?: Record<string, string>;

  constructor() {
    this.load();
  }

  load(options: { force: boolean } = { force: false }): void {
    if (options.force || isNil(EnvSource._env) || isEmpty(EnvSource._env)) {
      EnvSource._env = Object.assign({}, process.env) as Record<string, string>;
    }
  }

  get(key: string): string | undefined {
    return prop(key, EnvSource._env);
  }
}
