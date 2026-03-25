import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return new Response("Missing email for user creation", { status: 400 });
    }

    try {
      // 1. Create the user in Prisma, default role USER.
      await prisma.user.create({
        data: {
          clerkId: id!,
          email: email,
          role: "USER", // from Prisma Enum
        },
      });

      // 2. Sync role back to Clerk's publicMetadata so middleware can read sessionClaims
      const client = await clerkClient();
      await client.users.updateUserMetadata(id!, {
        publicMetadata: {
          role: "USER"
        }
      });
      console.log(`User ${id} created in Prisma & Clerk Metadata updated.`);
    } catch (error) {
       console.error("Failed to create user in webhook:", error);
       return new Response("Failed to sync user", { status: 500 });
    }
  }

  return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
}
