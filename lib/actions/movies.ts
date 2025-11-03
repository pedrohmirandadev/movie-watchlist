"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface MovieData {
  imdbID: string
  Title: string
  Year: string
  Director: string
  imdbRating: string
  Poster: string
  Plot: string
  Actors: string
  Genre: string
  Runtime: string
  Type: string
}

export async function getMovies() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })


  if (error) {
    throw error
  }

  return data || []
}

export async function addMovie(movieData: MovieData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  console.log("[v0] addMovie - User check:", { hasUser: !!user, userId: user?.id })
  
  if (!user) {
    throw new Error("Not authenticated")
  }

  const movieInsertData = {
    user_id: user.id,
    imdb_id: movieData.imdbID,
    title: movieData.Title,
    director: movieData.Director,
    imdb_rating: movieData.imdbRating,
    poster: movieData.Poster,
    year: movieData.Year,
    plot: movieData.Plot,
    actors: movieData.Actors,
    watched: false,
  }

  console.log("[v0] addMovie - Inserting movie:", { title: movieData.Title, userId: user.id })

  const { data, error } = await supabase
    .from("movies")
    .insert(movieInsertData)
    .select()
    .single()

  if (error) {
    console.log("[v0] addMovie - Error:", error)
    throw error
  }

  console.log("[v0] addMovie - Success:", { movieId: data.id })
  revalidatePath("/")
  return data
}

export async function toggleWatched(movieId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get current watched status
  const { data: movie } = await supabase
    .from("movies")
    .select("watched")
    .eq("id", movieId)
    .eq("user_id", user.id)
    .single()

  if (!movie) {
    throw new Error("Movie not found")
  }

  const { error } = await supabase
    .from("movies")
    .update({ watched: !movie.watched })
    .eq("id", movieId)
    .eq("user_id", user.id)

  if (error) {
    throw error
  }

  revalidatePath("/")
}

export async function deleteMovie(movieId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.from("movies").delete().eq("id", movieId).eq("user_id", user.id)

  if (error) {
    throw error
  }

  revalidatePath("/")
}
