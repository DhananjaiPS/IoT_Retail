import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../lib/prisma";

export default async function UserSync() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          clerkId: user.id,
          // Use primary email, fallback to 'no-email@example.com' if somehow none exists
          email: user.primaryEmailAddress?.emailAddress || 'no-email@example.com',
        },
      });
      console.log(`[UserSync] Synced new Clerk user to DB: ${user.id}`);
    }
  } catch (error) {
    console.error("[UserSync] Error syncing user to DB:", error);
  }

  return null;
}
