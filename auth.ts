import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async session({ session, token, user }) {
      session.user.id = token.sub as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      console.log(session);
      return session;
    },
  },
});
