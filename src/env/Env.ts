import {
  assoc,
  compose,
  defaultTo,
  isNil,
  join,
  map,
  reduce,
  match as rmatch,
  toPairs,
} from "rambda";
import zod from "zod";
import Sources from "./sources";
import fs from "fs";

export class Env {
  _env: Record<string, string>;
  _schema?: zod.Schema;

  constructor(env: Record<string, string> = {}, schema?: zod.Schema) {
    if (schema) {
      this._schema = schema;
    }

    const validate = this.validate.bind(this) as (
      _: Record<string, string>
    ) => Record<string, string>;

    const getEnvFromExternalSources = this.getEnvFromExternalSources.bind(
      this
    ) as (_: Record<string, string>) => Record<string, string>;

    this._env = compose(
      validate,
      getEnvFromExternalSources,
      defaultTo({})
    )(env);
  }

  private validate(env: Record<string, string>): Record<string, string> {
    if (this._schema) {
      return this._schema.parse(env);
    }

    return env;
  }

  getEnvFromExternalSources(
    env: Record<string, string>
  ): Record<string, string> {
    return compose<
      [Record<string, string>],
      (a: [string, string][]) => Record<string, string>
    >(
      reduce((acc, [key, value]: [string, string]) => {
        return assoc(key, value, acc);
      }, {}),
      // @ts-expect-error bad types definitions
      map<[string, string], [string, string]>(
        ([key, value]: [string, string]) => {
          const [_, result] = rmatch(/^{{(.*)}}$/, value);

          if (isNil(result)) {
            return [key, value] as const;
          }

          const valueFromSource = this.getValueFromSource(result);

          return [key, valueFromSource || ""] as const;
        }
      ),
      toPairs
    )(env) as Record<string, string>;
  }

  private getValueFromSource(key: string) {
    const [source, ...rest] = key.split(":");

    const valueToFound = rest.join(":");

    if (source in Sources) return Sources[source]().get(valueToFound);
    throw new Error(`Unknown source ${source}`);
  }

  get(key: string): string | undefined {
    return this._env[key];
  }

  renderToFile(file: string) {
    const lines = map(join("="), toPairs(this._env));

    fs.writeFileSync(file, lines.join("\n"));
  }
}
