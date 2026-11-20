import { NextResponse, type NextRequest } from 'next/server';

const LANG_COOKIE = 'bk_lang';

/** Hỗ trợ liên kết ?lang=en (khai báo trong hreflang): đặt ngôn ngữ cho yêu cầu này và nhớ vào cookie. */
export function middleware(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang');
  if (lang !== 'vi' && lang !== 'en') return NextResponse.next();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-lang', lang);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.cookies.set(LANG_COOKIE, lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|fonts|favicon.ico).*)']
};
