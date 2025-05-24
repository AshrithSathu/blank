import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { updateUserInConvex } from "./app/actions/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Update user in Convex database when they sign in
      if (user.email && user.name && user.image) {
        try {
          await updateUserInConvex({
            email: user.email,
            name: user.name,
            image: user.image,
          });
        } catch (error) {
          console.error("Failed to update user in Convex:", error);
          // Continue with sign in even if Convex update fails
        }
      }
      return true;
    },
    async session({ session }) {
      console.log(session);
      return session;
    },
  },
});
