"use client"

import { useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { MovieData } from "@/lib/actions/movies"

interface SearchResult {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
}

interface MovieSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMovie: (movie: MovieData) => void
}

export function MovieSearch({ open, onOpenChange, onSelectMovie }: MovieSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        if (data.Search) {
          setResults(data.Search)
        } else {
          setResults([])
        }
      } catch (error) {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = async (result: SearchResult) => {
    setSelectedId(result.imdbID)
    try {
      const response = await fetch(`/api/movie?id=${result.imdbID}`)
      const movie = await response.json()
      onSelectMovie(movie)
      setQuery("")
      setResults([])
    } catch (error) {
      console.error("Failed to fetch movie details:", error)
    } finally {
      setSelectedId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Buscar Filme</DialogTitle>
          <DialogDescription>Pesquise por filmes, séries ou animes no IMDB</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Digite o nome do filme..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="text-center py-8 text-muted-foreground">Nenhum resultado encontrado</div>
          )}

          {!loading && results.length === 0 && !query && (
            <div className="text-center py-8 text-muted-foreground">Digite para começar a buscar</div>
          )}

          <div className="space-y-2">
            {results.map((result) => (
              <button
                key={result.imdbID}
                onClick={() => handleSelect(result)}
                disabled={selectedId === result.imdbID}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent/10 transition-colors text-left disabled:opacity-50"
              >
                <img
                  src={
                    result.Poster !== "N/A" ? result.Poster : "/placeholder.svg?height=80&width=60&query=movie+poster"
                  }
                  alt={result.Title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{result.Title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{result.Year}</span>
                    <Badge variant="secondary" className="text-xs">
                      {result.Type}
                    </Badge>
                  </div>
                </div>
                {selectedId === result.imdbID && <Loader2 className="h-4 w-4 animate-spin" />}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
