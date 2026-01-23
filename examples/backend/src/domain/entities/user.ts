import type { Email } from "../valueObjects/email.js";

export class User {
  constructor(
    readonly id: number,
    readonly email: Email,
  ) {}
}
