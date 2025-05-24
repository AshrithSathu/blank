"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function updateUserInConvex(userData: {
  email: string;
  name: string;
  image: string;
}) {
  try {
    const userId = await convex.mutation(api.users.createOrUpdateUser, {
      email: userData.email,
      name: userData.name,
      image: userData.image,
    });

    console.log("User updated in Convex:", userId);
    return userId;
  } catch (error) {
    console.error("Error updating user in Convex:", error);
    throw error;
  }
}
