export const AUTH_COOKIES = {
  accessToken: "imtiaz_access_token",
  refreshToken: "imtiaz_refresh_token",
} as const;

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
