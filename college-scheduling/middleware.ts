import { withAuth } from "next-auth/middleware";

// Any authenticated user (Admin or User) can view dashboards; API enforces Admin for mutations.
export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      const pathname = req.nextUrl.pathname;
      if (pathname.startsWith("/login") || pathname.startsWith("/signup"))
        return true;
      if (!token) return false;
      return true;
    },
  },
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/departments/:path*",
    "/programs/:path*",
    "/semesters/:path*",
    "/subjects/:path*",
    "/prerequisites/:path*",
  ],
};
