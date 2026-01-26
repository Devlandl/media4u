"use client";

import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "https://exciting-pheasant-859.convex.site";

export const authClient = createAuthClient({
  baseURL: convexSiteUrl,
  plugins: [
    convexClient(),
    crossDomainClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
