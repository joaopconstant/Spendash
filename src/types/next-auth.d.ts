import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Estendendo o tipo Session para incluir o ID do usuário
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  /**
   * Estendendo o tipo User para garantir que tenha um ID
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * Estendendo o tipo JWT para incluir o ID do usuário
   */
  interface JWT {
    id: string;
  }
}
