import { describe, it, expect, vi, beforeEach } from "vitest";
import { DockerSource } from "./DockerSource";

describe("DockerSource", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Should be able to parse a basic docker compose file", () => {
    vi.mock("fs", () => {
      const file = `
      version: "3.8"
      services:
        app:
          image: "node:14"
          environment:
            - NODE_ENV=development
            - PORT=3000
            - DB_HOST=db
            - DB_PORT=5432
            - DB_USER=postgres
            - DB_PASSWORD=secret-pw
            - DB_NAME=my_db
        db:
          image: "postgres:13"
          environment:
            - POSTGRES_USER=postgres
            - POSTGRES_PASSWORD=secret-pw
            - POSTGRES_DB=my_db
            - PGDATA=/var/lib/postgresql/data/pgdata
            - POSTGRES_HOST_AUTH_METHOD=trust
      `;

      const dflt = {
        readFileSync: () => file,
        existsSync: () => true,
      };

      return {
        default: dflt,
        ...dflt,
      };
    });

    const docker = new DockerSource();

    expect(docker.get("app.NODE_ENV")).toBe("development");
    expect(docker.get("db.POSTGRES_USER")).toBe("postgres");
    expect(docker.get("db.POSTGRES_PASSWORD")).toBe("secret-pw");
    expect(docker.get("db.POSTGRES_DB")).toBe("my_db");
  });
});
