import { auth } from "../lib/auth.js";

type User = typeof auth.$Infer.Session.user;

declare global {
  namespace Express {
    interface Locals {
      user: User;
    }
  }
}
export {};
