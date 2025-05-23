import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      image: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId: string;
    username: string;
    avatar: string;
  }
}
