import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    redirectUri: process.env.APP_BASE_URL,
    audience: process.env.AUTH0_AUDIENCE,
    scope: "openid profile email",
    response_type: "code",
    response_mode: "query",
  },
});
