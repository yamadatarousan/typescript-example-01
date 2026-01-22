import type { Email } from "../../domain/valueObjects/email";

export type LoginUserInput = {
  email: Email;
  password: string;
};

export type LoginUserOutput = {
  id: number;
  email: string;
};

export type LoginUser = (input: LoginUserInput) => Promise<LoginUserOutput>;
