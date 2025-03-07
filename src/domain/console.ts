import type { Console } from "./types";

export class Console implements Console {
  log(message: string): void {
    console.log(message);
  }
}
