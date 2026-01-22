import type { Email } from "../../domain/valueObjects/email";

export type SignUpUserInput = {
  email: Email;
  password: string;
};

export type SignUpUserOutput = {
  id: number;
  email: string;
};

export type SignUpUser = (input: SignUpUserInput) => Promise<SignUpUserOutput>;
