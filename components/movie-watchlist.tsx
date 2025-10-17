"use client"

import { useState, useEffect } from "react"
import { Film, Plus, Eye, EyeOff, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MovieSearch } from "@/components/movie-search"
import { MovieTable } from "@/components/movie-table"
import { MovieDetailsDialog } from "@/components/movie-details-dialog"
import { useToast } from "@/hooks/use-toast"
import { getMovies, addMovie, toggleWatched, deleteMovie, type MovieData } from "@/lib/actions/movies"
import { signOut } from "@/lib/actions/auth"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export interface Movie {
  id: string
  imdb_id: string
  title: string
  year: string
  director: string
  imdb_rating: string
  poster: string
  plot: string
  actors: string
  watched: boolean
  created_at: string
}

interface MovieWatchlistProps {
  user: SupabaseUser
}

export function MovieWatchlist({ user }: MovieWatchlistProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [showWatched, setShowWatched] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadMovies()
  }, [])

  const loadMovies = async () => {
    try {
      setIsLoading(true)
      const data = await getMovies()
      setMovies(data)
    } catch (error) {
      toast({
        title: "Erro ao carregar filmes",
        description: "Não foi possível carregar seus filmes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMovie = async (movieData: MovieData) => {
    const exists = movies.find((m) => m.imdb_id === movieData.imdbID)
    if (exists) {
      toast({
        title: "Filme já adicionado",
        description: "Este filme já está na sua lista",
        variant: "destructive",
      })
      return
    }

    try {
      await addMovie(movieData)
      await loadMovies()
      toast({
        title: "Filme adicionado!",
        description: `${movieData.Title} foi adicionado à sua watchlist`,
      })
      setIsSearchOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao adicionar filme",
        description: "Não foi possível adicionar o filme",
        variant: "destructive",
      })
    }
  }

  const handleToggleWatched = async (movieId: string) => {
    try {
      await toggleWatched(movieId)
      await loadMovies()
    } catch (error) {
      toast({
        title: "Erro ao atualizar filme",
        description: "Não foi possível atualizar o status do filme",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMovie = async (movieId: string) => {
    const movie = movies.find((m) => m.id === movieId)
    try {
      await deleteMovie(movieId)
      await loadMovies()
      toast({
        title: "Filme removido",
        description: `${movie?.title} foi removido da sua lista`,
      })
    } catch (error) {
      toast({
        title: "Erro ao remover filme",
        description: "Não foi possível remover o filme",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const filteredMovies = showWatched ? movies : movies.filter((m) => !m.watched)

  const watchedCount = movies.filter((m) => m.watched).length
  const unwatchedCount = movies.filter((m) => !m.watched).length

  const userName = user.user_metadata?.name || user.email?.split("@")[0] || "Usuário"

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Film className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">CineList</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                <User className="h-4 w-4" />
                {userName}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
        <p className="text-muted-foreground text-lg">Organize seus filmes, séries e animes para assistir</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{movies.length}</p>
            </div>
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Para Assistir</p>
              <p className="text-2xl font-bold text-primary">{unwatchedCount}</p>
            </div>
            <EyeOff className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assistidos</p>
              <p className="text-2xl font-bold text-accent">{watchedCount}</p>
            </div>
            <Eye className="h-8 w-8 text-accent" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button onClick={() => setIsSearchOpen(true)} size="lg" className="flex-1 sm:flex-none">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Filme
        </Button>
        <Button variant={showWatched ? "default" : "outline"} onClick={() => setShowWatched(!showWatched)} size="lg">
          {showWatched ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Mostrar Apenas Não Vistos
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Mostrar Todos
            </>
          )}
        </Button>
      </div>

      {/* Movie Table */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando seus filmes...</p>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {movies.length === 0 ? "Nenhum filme adicionado" : "Nenhum filme para assistir"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {movies.length === 0 ? "Comece adicionando filmes à sua watchlist" : "Você já assistiu todos os filmes!"}
          </p>
          {movies.length === 0 && (
            <Button onClick={() => setIsSearchOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Filme
            </Button>
          )}
        </div>
      ) : (
        <MovieTable
          movies={filteredMovies}
          onToggleWatched={handleToggleWatched}
          onDelete={handleDeleteMovie}
          onRowClick={setSelectedMovie}
        />
      )}

      {/* Search Dialog */}
      <MovieSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} onSelectMovie={handleAddMovie} />

      {/* Details Dialog */}
      <MovieDetailsDialog movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  )
}
