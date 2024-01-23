import { describe, it, expect, beforeEach } from "vitest";
import { EnvSource } from "./EnvSource";
import { v4 as uuidv4 } from "uuid";

describe("EnvSource", () => {
  beforeEach(() => {
    EnvSource._env = undefined;
  });

  it("Should load the env on the constructor", () => {
    const id = uuidv4();
    process.env.FOO = id;

    expect(new EnvSource().get("FOO")).toBe(id);
  });

  it("Should not reload the env if it was already loaded", () => {
    const id = "expected_" + uuidv4();
    process.env.FOO = id;

    const envSource = new EnvSource();
    process.env.FOO = "unwanted_" + uuidv4();
    envSource.load();

    expect(envSource.get("FOO")).toBe(id);
  });

  it("Should reload the env if it was already loaded and force reload", () => {
    process.env.FOO = "unwanted_" + uuidv4();

    const envSource = new EnvSource();
    const id = "expected_" + uuidv4();
    process.env.FOO = id;
    envSource.load({ force: true });

    expect(envSource.get("FOO")).toBe(id);
  });
});
