import { describe, it, expect, vi, beforeEach } from "vitest";
import { UuidSource } from "./UuidSource";

describe("UUID Source", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should generate a uuid", () => {
    const source = new UuidSource();

    vi.mock("uuid", () => ({
      v4: () => "my-uuid",
    }));

    expect(source.get("")).to.equal("my-uuid");
    expect(source.get("TEST")).to.equal("my-uuid");
  });
});
