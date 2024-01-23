import { BaseSource } from "./BaseSource";
import { v4 as uuid } from "uuid";

export class UuidSource implements BaseSource {
  get(key: string): string | undefined {
    return uuid();
  }

  /* v8 ignore next 3 */
  load(): void {
    // * Non-sense to load something
  }
}
