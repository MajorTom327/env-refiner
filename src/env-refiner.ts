import { Env, EnvFileLoader } from "./env";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

(async () => {
  const options = await yargs(hideBin(process.argv))
    .option("input", {
      demandOption: true,
      alias: "i",
      type: "string",
      description: "The file to read the env from",
    })
    .option("output", {
      demandOption: true,
      alias: "o",
      type: "string",
      description: "The file to write the env from",
    })
    .parse();

  const { input, output } = options;

  const loadedEnv = new EnvFileLoader(input).load();
  const env = new Env(loadedEnv);

  env.renderToFile(output || "./.env");
})();
