import {
  assoc,
  clone,
  compose,
  defaultTo,
  isEmpty,
  isNil,
  join,
  map,
  reduce,
  match as rmatch,
  toPairs,
} from "rambda";
import * as zod from "zod";
import Sources, { SourceEnum } from "./sources";
import * as fs from "fs";

export class Env {
  _env: Record<string, string>;
  _schema?: zod.Schema;
  _publichSchema?: zod.Schema;

  set publicSchema(schema: zod.Schema) {
    this._publichSchema = schema;
  }

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

    const cleanupEnvVars = this.cleanupEnvVars.bind(this) as (
      _: Record<string, string>
    ) => Record<string, string>;

    this._env = compose(
      validate,
      cleanupEnvVars,
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

  private cleanupEnvVars(env: Record<string, string>): Record<string, string> {
    const pairs = toPairs(env);
    return pairs.reduce(
      (acc, [key, value]) => {
        if (value.startsWith('"') && value.endsWith('"')) {
          // Emsure empties are not removed
          if (value.length === 2) {
            return { ...acc, [key]: "" };
          }

          const newValue = value.slice(1, -1);
          return { ...acc, [key]: newValue };
        }
        return { ...acc, [key]: value };
      },
      {} as Record<string, string>
    );
  }

  getEnvFromExternalSources(
    env: Record<string, string>
  ): Record<string, string> {
    console.countReset("Mapping keys");
    const mappingRegex = /{{([^}]*)}}/g;
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
          const result = rmatch(mappingRegex, value);

          if (isEmpty(result)) {
            return [key, value] as const;
          }

          const resultValue = result.reduce((acc, match) => {
            const value = this.getValueFromSource(match) || "";
            return acc.replaceAll(match, value);
          }, value);

          return [key, resultValue] as const;
        }
      ),
      toPairs
    )(env) as Record<string, string>;
  }

  private getValueFromSource(key: string) {
    const [source, ...rest] = key
      .replaceAll("{", "")
      .replaceAll("}", "")
      .split(":");

    const valueToFound = rest.join(":");

    try {
      const cleanSource = zod.nativeEnum(SourceEnum).parse(source);

      return Sources[cleanSource]().get(valueToFound);
    } catch (e: any) {
      throw new Error(`Unknown source ${source} Error: ${e.message}`);
    }
  }

  get<T = string | undefined>(key: string): T {
    return this._env[key] as T;
  }

  getEnv(): Record<string, string> {
    return clone(this._env);
  }

  getPublicEnv(): Record<string, string> {
    if (!this._publichSchema) {
      return {};
    }

    return this._publichSchema.parse(this._env);
  }

  renderToFile(file: string) {
    const lines = map(join("="), toPairs(this._env));

    fs.writeFileSync(file, lines.join("\n"));
  }
}
