import { Email } from "../valueObjects/email";

export class User {
  constructor(readonly id: number, readonly email: Email) {}
}
