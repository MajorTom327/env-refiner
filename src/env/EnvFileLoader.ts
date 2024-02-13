import * as fs from "fs";
import * as path from "path";
import { assoc, clone, compose, isEmpty, isNil, keys, reduce, reject } from "rambda";
import { P, match } from "ts-pattern";

export class EnvFileLoader {
  file?: string;

  constructor(file?: string) {
    this.file = file;
  }

  private parseRow(line: string) {
    if (line.trim().startsWith("#")) {
      return null;
    }

    const [key, ...rest] = line.trim().split("=");

    if (!key || !rest) {
      return null;
    }

    const value = rest.join("=");
    return { key, value };
  }

  load(file?: string): Record<string, string> {
    let fileToLoad = match({ file, config: this.file })
      .with({ file: P.string }, ({ file }) => file)

      .with({ config: P.string }, ({ config }) => config)
      .otherwise(() => path.join(process.cwd(), ".env")) as string;

      let lines: string[] = []

    try {
      const env = fs.readFileSync(fileToLoad, "utf-8");
      lines = env.split("\n");
    }
    catch (e) {
      lines = keys(process.env).map((key) => {
        return (`${key}=${process.env[key]}`);
      })
    }

    const loadedEnv = compose(
      reduce((acc, line: string) => {
        const parserLine = this.parseRow(line);
        if (isNil(parserLine)) {
          return acc;
        }

        return assoc(parserLine.key, parserLine.value, acc);
      }, {}),
      reject(isEmpty)
    )(lines);

    return {
      ...loadedEnv,
    };
  }
}
