import { NextRequest, NextResponse } from 'next/server';
import { isVaildPassword } from './lib/isValidPassword';

// Define Middleware for protecting routes
export async function middleware(req: NextRequest) {
  const authenticated = await isAuthenticated(req);

  if (!authenticated) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic' }, // Setting this header will prompt user to enter credientials https://www.geeksforgeeks.org/http-headers-www-authenticate/
    });
  }
}

// Returns a Boolean value after comparing username and password input
async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const authHeader =
    req.headers.get('authorization') || req.headers.get('Authorization');

  if (!authHeader) return false;

  // Decrypt the credientials
  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':');

  // Compare user name input with the stored user name and password input
  return (
    username === process.env.ADMIN_USERNAME &&
    (await isVaildPassword(
      password,
      process.env.HASHED_ADMIN_PASSWORD as string
    ))
  );
}

// Filter Middleware to run on specific paths -> only run this middleware in admin routes -> Protecting admin routes
export const config = {
  matcher: '/admin/:path*',
};
