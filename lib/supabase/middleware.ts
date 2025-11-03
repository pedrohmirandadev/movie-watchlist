import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api") || request.nextUrl.pathname.startsWith("/_vercel")) {
    return NextResponse.next()
  }

  console.log("[v0] Middleware - Path:", request.nextUrl.pathname)
  console.log("[v0] Middleware - NODE_ENV:", process.env.NODE_ENV)

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
          // Ensure cookies work properly in production
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
  console.log("[v0] Middleware - Path:", request.nextUrl.pathname)
  console.log("[v0] Middleware - Cookies count:", cookies.length)
  console.log(
    "[v0] Middleware - Has auth cookies:",
    cookies.some((c) => c.name.includes("sb-")),
  )
  console.log("[v0] Middleware - Cookie names:", cookies.map((c) => c.name).join(", "))
  
  // Log specific Supabase cookies
  const supabaseCookies = cookies.filter((c) => c.name.includes("sb-"))
  console.log("[v0] Middleware - Supabase cookies:", supabaseCookies.map((c) => `${c.name}=${c.value.substring(0, 20)}...`).join(", "))

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log("[v0] Middleware - User authenticated:", !!user)
  console.log("[v0] Middleware - User email:", user?.email)
  console.log("[v0] Middleware - User ID:", user?.id)
  console.log("[v0] Middleware - User error:", userError)
  
  // Check session directly
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  console.log("[v0] Middleware - Session exists:", !!session)
  console.log("[v0] Middleware - Session error:", sessionError)
  console.log("[v0] Middleware - Session access token:", session?.access_token ? "exists" : "missing")

  if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    console.log("[v0] Middleware - Redirecting authenticated user from", request.nextUrl.pathname, "to /")
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
