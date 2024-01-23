import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import config from "./index";
import * as zod from "zod";
import { DateTime } from "luxon";

describe("Integration of the configurator", () => {
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

  it("Should define a complete environment configuration", () => {
    process.env = {
      APP_NAME: "my-app",
      NODE_ENV: "production",
    };

    vi.mock("fs", () => {
      const dflt = {
        readFileSync: (f) => {
          const fileName = path.basename(f);
          // console.log(fileName);

          if (fileName === ".env") {
            return `
            APP_NAME={{env:APP_NAME}}
            # DATABASE_URL={{docker:db.DB_URL}}
            POSTGRES_USER={{docker:db.POSTGRES_USER}}
            POSTGRES_PASSWORD={{docker:db.POSTGRES_PASSWORD}}
            POSTGRES_DB={{docker:db.POSTGRES_DB}}
            COOKIE_SECRET={{uuid}}
            BUILD_DATE={{date}}
            `;
          }

          if (fileName === "docker-compose.yml") {
            return `
            version: "3.7"
            services:
              db:
                image: postgres:latest
                environment:
                  - POSTGRES_USER=postgres
                  - POSTGRES_PASSWORD=postgres
                  - POSTGRES_DB=postgres
            `;
          }

          throw new Error(`File ${f} not found`);
        },
      };

      return {
        default: dflt,
        ...dflt,
      };
    });
    const env = config();

    const matchSchema = zod
      .object({
        APP_NAME: zod.literal("my-app"),
        POSTGRES_USER: zod.literal("postgres"),
        POSTGRES_PASSWORD: zod.literal("postgres"),
        POSTGRES_DB: zod.literal("postgres"),
        COOKIE_SECRET: zod.string().uuid(),
        BUILD_DATE: zod.coerce
          .date()
          .refine(
            (d) => DateTime.fromJSDate(d).diff(defaultDate).milliseconds === 0
          ),
      })
      .safeParse(env._env);
    expect(matchSchema).toHaveProperty("success", true);

    expect(env.get("NODE_ENV")).toBeUndefined();
    expect(env.get("NOT_DEFINED")).toBeUndefined();
  });

  it("Should define a complete environment configuration with validation", () => {
    process.env = {
      APP_NAME: "my-app",
      NODE_ENV: "production",
    };

    vi.mock("fs", () => {
      const dflt = {
        readFileSync: (f) => {
          const fileName = path.basename(f);
          // console.log(fileName);

          if (fileName === ".env") {
            return `
            APP_NAME={{env:APP_NAME}}
            # DATABASE_URL={{docker:db.DB_URL}}
            POSTGRES_USER={{docker:db.POSTGRES_USER}}
            POSTGRES_PASSWORD={{docker:db.POSTGRES_PASSWORD}}
            POSTGRES_DB={{docker:db.POSTGRES_DB}}
            COOKIE_SECRET={{uuid}}
            BUILD_DATE={{date}}
            `;
          }

          if (fileName === "docker-compose.yml") {
            return `
            version: "3.7"
            services:
              db:
                image: postgres:latest
                environment:
                  - POSTGRES_USER=postgres
                  - POSTGRES_PASSWORD=postgres
                  - POSTGRES_DB=postgres
            `;
          }

          throw new Error(`File ${f} not found`);
        },
      };

      return {
        default: dflt,
        ...dflt,
      };
    });
    const env = config({
      schema: zod.object({
        APP_NAME: zod.literal("my-app"),
        POSTGRES_USER: zod.literal("postgres"),
        POSTGRES_PASSWORD: zod.literal("postgres"),
        POSTGRES_DB: zod.literal("postgres"),
        COOKIE_SECRET: zod.string().uuid(),
        BUILD_DATE: zod.coerce.date(),
      }),
    });

    const matchSchema = zod
      .object({
        APP_NAME: zod.literal("my-app"),
        POSTGRES_USER: zod.literal("postgres"),
        POSTGRES_PASSWORD: zod.literal("postgres"),
        POSTGRES_DB: zod.literal("postgres"),
        COOKIE_SECRET: zod.string().uuid(),
        BUILD_DATE: zod.coerce
          .date()
          .refine(
            (d) => DateTime.fromJSDate(d).diff(defaultDate).milliseconds === 0
          ),
      })
      .safeParse(env._env);
    expect(matchSchema).toHaveProperty("success", true);

    expect(env.get("NODE_ENV")).toBeUndefined();
    expect(env.get("NOT_DEFINED")).toBeUndefined();
  });
});
