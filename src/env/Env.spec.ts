import { describe, it, expect, vi, beforeEach } from "vitest";
import { Env } from "./Env";
import * as zod from "zod";
import { v4 as uuid } from "uuid";
import { EnvSource } from "./sources";

describe("Environment definition", () => {
  it("Should set the environement from the constructor", () => {
    const env = new Env({ foo: "bar" });

    expect(env._env).to.deep.equal({ foo: "bar" });
  });

  it("Should define a empty object as default", () => {
    const env = new Env();

    expect(env._env).to.deep.equal({});
  });

  it("Should get a value from the environment", () => {
    const env = new Env({ foo: "bar" });

    expect(env.get("foo")).to.equal("bar");
  });
});

describe("Environment validation", () => {
  it("Should validate the environment", () => {
    const env = new Env({ foo: "bar" }, zod.object({ foo: zod.string() }));

    expect(env._env).to.deep.equal({ foo: "bar" });
  });

  it("Should throw an error if the environment is not valid", () => {
    expect(() => {
      new Env({ foo: "bar" }, zod.object({ foo: zod.number() }));
    }).to.throw();
  });

  it("Should trim not set value", () => {
    const env = new Env(
      { foo: "bar", baz: "" },
      zod.object({ foo: zod.string() })
    );

    expect(env._env).to.deep.equal({ foo: "bar" });
  });
});

describe("Load from external informations", () => {
  beforeEach(() => {
    delete EnvSource._env;
  });

  describe("Load from the original environment", () => {
    it("Should load correctly from env", () => {
      process.env.FOO = "bar";

      const env = new Env();

      const result = env.getEnvFromExternalSources({
        FOO: "{{env:FOO}}",
      });

      expect(result).to.deep.equal({
        FOO: "bar",
      });
    });

    it("Should ignore the value if not a loadable env key", () => {
      const env = new Env({
        FOO: "BAR",
      });

      const result = env.getEnvFromExternalSources(env._env);

      expect(result).to.deep.equal({
        FOO: "BAR",
      });
    });

    it("Should have a empty string if the value is empty", () => {
      process.env.FOO = "";

      const env = new Env({
        FOO: "",
      });

      const result = env.getEnvFromExternalSources({
        FOO: "{{env:FOO}}",
      });

      expect(result).to.deep.equal({
        FOO: "",
      });
    });

    it("Should have a empty string if the value is not set", () => {
      delete process.env.FOO;

      const env = new Env({
        FOO: "",
      });

      const result = env.getEnvFromExternalSources({
        FOO: "{{env:FOO}}",
      });

      expect(result).to.deep.equal({
        FOO: "",
      });
    });
  });

  describe("Integration of the loaders", () => {
    it("Should load the environment from the process", () => {
      process.env.FOO = "bar";

      const env = new Env({
        FOO: "{{env:FOO}}",
      });

      expect(env._env).to.deep.equal({ FOO: "bar" });
    });

    it("Should handle a bad loader", () => {
      process.env.FOO = "bar";

      expect(
        () =>
          new Env({
            FOO: "{{idontexist:FOO}}",
          })
      ).to.throw("Unknown source idontexist");
    });

    it("Should load a uuid", () => {
      const env = new Env({
        FOO: "{{uuid}}",
      });

      expect(env._env.FOO).to.be.a("string");
      expect(zod.string().uuid().safeParse(env._env.FOO)).toHaveProperty(
        "success",
        true
      );
    });
  });

  it("Unknown source", () => {
    process.env.FOO = "bar";
    const id = uuid();

    expect(
      () =>
        new Env({
          FOO: `{{${id}:FOO}}`,
        })
    ).to.throw(`Unknown source ${id}`);
  });
});

describe("Render the environment to file", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Should render the environment to file", async () => {
    vi.mock("fs");

    const fs = await import("fs");

    const env = new Env({
      FOO: "bar",
    });

    env.renderToFile("./.env");
    expect(fs.writeFileSync).to.toHaveBeenCalledWith(
      "./.env",
      ["FOO=bar"].join("\n")
    );
  });

  it("Should render the environment to file (many lines)", async () => {
    vi.mock("fs");

    const fs = await import("fs");

    const env = new Env({
      FOO: "bar",
      BAZ: "qux",
    });

    env.renderToFile("./.env");
    expect(fs.writeFileSync).to.toHaveBeenCalledWith(
      "./.env",
      ["FOO=bar", "BAZ=qux"].join("\n")
    );
  });
});
