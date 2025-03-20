import type { Console as ConsoleInterface } from "../domain/types";

export class Console implements ConsoleInterface {
  log(message: string): void {
    console.log(message);
  }
}
