import { Env, EnvFileLoader } from "./env";

type Config = {
  schema?: Zod.Schema;
  publicSchema?: Zod.Schema;
  envFile?: string;
};

export const config = ({ schema, publicSchema, envFile }: Config = {}) => {
  const loadedEnv = new EnvFileLoader(envFile).load();
  const env = new Env(loadedEnv, schema);

  if (publicSchema) {
    env.publicSchema = publicSchema;
  }

  return env;
};

export default config;
