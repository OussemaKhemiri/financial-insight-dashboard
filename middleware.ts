// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // 1. Check if we are in Development
    // We usually don't want the login prompt while coding locally
    if (process.env.NODE_ENV === 'development') {
        return NextResponse.next();
    }

    // 2. Get the Basic Auth credentials from Environment Variables
    const validUser = process.env.BASIC_AUTH_USER;
    const validPass = process.env.BASIC_AUTH_PASSWORD;

    // If variables aren't set in Vercel, allow access (or block it, your choice)
    if (!validUser || !validPass) {
        return NextResponse.next();
    }

    // 3. Parse the Authorization header
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        if (user === validUser && pwd === validPass) {
            return NextResponse.next();
        }
    }

    // 4. If invalid or missing header, return 401 to trigger the browser prompt
    return new NextResponse('Authentication Required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Dashboard"',
        },
    });
}

// Apply to all routes except static files (images, favicon, etc.)
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};