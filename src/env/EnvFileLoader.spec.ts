import { describe, it, expect, beforeEach, vi } from "vitest";
import path from "path";
import { EnvFileLoader } from "./EnvFileLoader";

const basePath = "./test/data/env/EnvLoader";

describe("Loading an environment", () => {
  beforeEach(() => {
    process.env = {};
    vi.resetAllMocks();
  });

  it("Should load from the constructor", () => {
    const file = path.join(basePath, "1.env");

    vi.mock("fs", () => {
      const file = `
      FOO=bar
      BAR=baz
      `;

      const dflt = {
        readFileSync: () => file,
      };

      return {
        default: dflt,
        ...dflt,
      };
    });

    const envLoader = new EnvFileLoader(file);
    const env = envLoader.load();

    expect(env).toHaveProperty("FOO", "bar");
    expect(env).toHaveProperty("BAR", "baz");
  });

  it("Should load a basic env", () => {
    const file = path.join(basePath, "1.env");

    const envLoader = new EnvFileLoader();
    const env = envLoader.load(file);

    vi.mock("fs", () => {
      const file = `
      FOO=bar
      BAR=baz
      `;

      const dflt = {
        readFileSync: () => file,
      };

      return {
        default: dflt,
        ...dflt,
      };
    });

    expect(env).toEqual({
      FOO: "bar",
      BAR: "baz",
    });
  });

  it("Should ignore comments", () => {
    const file = path.join(basePath, "1.env");

    const envLoader = new EnvFileLoader();
    const env = envLoader.load(file);

    vi.mock("fs", () => {
      const file = `
      # This is a comment
      FOO=bar
      # This is another comment
      BAR=baz
      `;

      const dflt = {
        readFileSync: () => file,
      };

      return {
        default: dflt,
        ...dflt,
      };
    });

    expect(env).toEqual({
      FOO: "bar",
      BAR: "baz",
    });
  });

  it("Should ignore empty line", () => {
    const file = path.join(basePath, "1.env");

    const envLoader = new EnvFileLoader();
    const env = envLoader.load(file);

    vi.mock("fs", () => {
      const file = `

      FOO=bar

      BAR=baz
      `;

      const dflt = {
        readFileSync: () => file,
      };

      return {
        default: dflt,
        ...dflt,
      };
    });

    expect(env).toEqual({
      FOO: "bar",
      BAR: "baz",
    });
  });

  it("Should load by default the project env", () => {
    const envLoader = new EnvFileLoader();
    const env = envLoader.load();

    expect(env).toHaveProperty("FOO", "bar");
    expect(env).toHaveProperty("BAR", "baz");
  });
});
