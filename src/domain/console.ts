import type { Console as ConsoleInterface } from "./types";

export class Console implements ConsoleInterface {
  log(message: string): void {
    console.log(message);
  }
}
