// Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const secret = process.env.NEXTAUTH_SECRET;
  const cookieName = process.env.NEXTAUTH_COOKIE_NAME || 'authjs.session-token';
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined');
  }

  //@ts-ignore
  const token = await getToken({
    req,
    secret,
    cookieName
  });

  if (!token) {
    const url = req.url.replace(req.nextUrl.pathname, '/');
    return NextResponse.redirect(url);
  }

  if (
    !token.caldavConfigured &&
    req.nextUrl.pathname.startsWith('/dashboard') &&
    req.nextUrl.pathname !== '/dashboard/setup-caldav'
  ) {
    const setupUrl = req.url.replace(
      req.nextUrl.pathname,
      '/dashboard/setup-caldav'
    );
    return NextResponse.redirect(setupUrl);
  }

  return NextResponse.next();
});

export const config = { matcher: ['/dashboard/:path*'] };
