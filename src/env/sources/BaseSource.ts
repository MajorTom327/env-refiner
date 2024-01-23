/* v8 ignore start */
/**
 * This is only the common interface for all sources
 */

export interface BaseSource {
  get(key: string): string | undefined;
  load(): void;
}
/* v8 ignore stop */
