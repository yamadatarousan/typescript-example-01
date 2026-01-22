import type { Email } from "../../domain/valueObjects/email";
import { signUp } from "../../services/authService";

export type SignUpUserInput = {
  email: Email;
  password: string;
};

export type SignUpUserOutput = {
  token: string;
  user: {
    id: number;
    email: string;
  };
};

export type SignUpUser = (input: SignUpUserInput) => Promise<SignUpUserOutput>;

export function buildSignUpUser(jwtSecret: string): SignUpUser {
  return async (input: SignUpUserInput) => {
    return signUp(input.email.value, input.password, jwtSecret);
  };
}
