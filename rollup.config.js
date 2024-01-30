import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { either, isNil, isEmpty, reject } from "rambda";

const tsConfig = {
  declaration: true,
  declarationDir: "dist",
  exclude: ["**/*.spec.ts", "node_modules/**/*"],
  rootDir: "src/",
};

const isDev = process.env.NODE_ENV === "development";
const isNilOrEmpty = either(isNil, isEmpty);

const plugins = reject(isNilOrEmpty)([
  typescript(tsConfig),
  isDev ? undefined : terser(),
]);

const commonConfig = {
  input: "src/index.ts",
  plugins,
  external: ["zod", "path", "fs"],
};

export default [
  {
    ...commonConfig,
    output: {
      dir: "./dist",
      entryFileNames: "index.js",
      format: "cjs",
    },
  },

  // ES
  {
    ...commonConfig,

    output: { file: "dist/es/index.js", format: "es" },
  },
  {
    input: "src/env-refiner.ts",
    plugins,
    external: ["zod", "path", "fs"],
    output: {
      intro: "#!/usr/bin/env node",
      file: "dist/bin/es/env-refiner",
      format: "es",
    },
  },
  {
    input: "src/env-refiner.ts",
    plugins,

    external: ["zod", "path", "fs"],
    output: {
      intro: "#!/usr/bin/env node",
      file: "dist/bin/env-refiner",
      format: "cjs",
    },
  },
];
