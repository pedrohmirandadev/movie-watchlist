import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MovieWatchlist } from "@/components/movie-watchlist"

export default async function Home() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <main className="min-h-screen bg-background">
      <MovieWatchlist user={data.user} />
    </main>
  )
}
