import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DateSource } from "./DateSource";
import { DateTime } from "luxon";

describe("Date Source", () => {
  const defaultDate = DateTime.fromObject({
    year: 2020,
    month: 5,
    day: 15,
    hour: 17,
    minute: 31,
    second: 2,
  });
  beforeEach(() => {
    vi.useFakeTimers({});

    vi.setSystemTime(defaultDate.toJSDate());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the current iso date", () => {
    const source = new DateSource();

    const expected = defaultDate.toISO();

    expect(source.get("")).to.equal(expected);
    expect(source.get("TEST")).to.equal(expected);
  });
});
