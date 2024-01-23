import { DateTime } from "luxon";
import { BaseSource } from "./BaseSource";

export class DateSource implements BaseSource {
  get(key: string): string | undefined {
    return DateTime.local().toISO();
  }

  /* v8 ignore next 3 */
  load(): void {
    // * Non-sense to load something
  }
}
