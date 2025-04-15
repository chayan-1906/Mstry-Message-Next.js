import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import routes from "@/lib/routes";
import {getToken} from "next-auth/jwt";

export {default} from "next-auth/middleware";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const token = await getToken({req: request});
    const url = request.nextUrl;
    if (token && (
        url.pathname.startsWith(routes.signInPath) ||
        url.pathname.startsWith(routes.signUpPath) ||
        url.pathname.startsWith(routes.verifyPath()) ||
        url.pathname === routes.homePath
    )) {
        return NextResponse.redirect(new URL(routes.dashboardPath, request.url));
    }
    if (!token && url.pathname.startsWith('/dashboard')) {
        console.log('token:', token);
        console.log(url.pathname);
        return NextResponse.redirect(new URL(routes.signInPath, request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        routes.signInPath,
        routes.signUpPath,
        `${routes.verifyPath()}/:path*`,
        routes.homePath,
        `${routes.dashboardPath}/:path*`,
    ],
}

