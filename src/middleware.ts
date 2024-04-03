import { NextRequest, NextResponse } from 'next/server';
import { isVaildPassword } from './lib/isValidPassword';

//Define Middleware
export async function middleware(req: NextRequest) {
  const authenticated = await isAuthenticated(req);

  if (!authenticated) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic' },
    });
  }
}

async function isAuthenticated(req: NextRequest) {
  const authHeader =
    req.headers.get('authorization') || req.headers.get('Authorization');

  if (!authHeader) return false;

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':');

  //console.log(username, password);
  return (
    username === process.env.ADMIN_USERNAME &&
    (await isVaildPassword(
      password,
      process.env.HASHED_ADMIN_PASSWORD as string
    ))
  );
}

// Filter Middleware to run on specific paths
export const config = {
  matcher: '/admin/:path*',
};
