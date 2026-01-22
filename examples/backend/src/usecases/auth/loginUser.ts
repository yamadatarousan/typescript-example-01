import type { Email } from "../../domain/valueObjects/email";
import { login } from "../../services/authService";

export type LoginUserInput = {
  email: Email;
  password: string;
};

export type LoginUserOutput = {
  token: string;
  user: {
    id: number;
    email: string;
  };
};

export type LoginUser = (input: LoginUserInput) => Promise<LoginUserOutput>;

export function buildLoginUser(jwtSecret: string): LoginUser {
  return async (input: LoginUserInput) => {
    return login(input.email.value, input.password, jwtSecret);
  };
}
