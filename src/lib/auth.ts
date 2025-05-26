import DiscordProvider from "next-auth/providers/discord";
import prisma from "./primsa";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const discordProfile = profile as {
          id: string;
          username: string;
          avatar: string;
        };

        token.discordId = discordProfile.id;
        token.username = discordProfile.username;
        token.avatar = `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`;

        const user = await prisma.user.findUnique({
          where: { discordId: discordProfile.id },
        });
        if (!user) {
          await prisma.user.create({
            data: {
              discordId: discordProfile.id,
              username: discordProfile.username,
              avatarUrl: token.avatar,
            },
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.discordId;
        session.user.name = token.username;
        session.user.image = token.avatar;
      }
      return session;
    },
  },
};
