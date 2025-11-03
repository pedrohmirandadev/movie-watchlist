import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api") || request.nextUrl.pathname.startsWith("/_vercel")) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (request.nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.next()
    }
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions = {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
          }
          supabaseResponse.cookies.set(name, value, cookieOptions)
        })
      },
    },
  })

  const cookies = request.cookies.getAll()
  
  const supabaseCookies = cookies.filter((c) => c.name.includes("sb-"))

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
