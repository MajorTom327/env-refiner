import { Env, EnvFileLoader } from "./env";

type Config = {
  schema?: Zod.Schema;
  envFile?: string;
};

export const config = ({ schema, envFile }: Config = {}) => {
  const loadedEnv = new EnvFileLoader(envFile).load();
  const env = new Env(loadedEnv, schema);

  return env;
};

export default config;
