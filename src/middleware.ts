import middleware from "next-auth/middleware";
export default middleware;

export const config = {
  matcher: [
    "/((?!api/auth|api/cron|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
