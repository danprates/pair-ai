import type { Log } from "./types";

export class Console implements Log {
  log(message: string): void {
    console.log(message);
  }
}
