"use client"

import { Star, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Movie } from "./movie-watchlist"

interface MovieDetailsDialogProps {
  movie: Movie | null
  onClose: () => void
}

export function MovieDetailsDialog({ movie, onClose }: MovieDetailsDialogProps) {
  if (!movie) return null

  return (
    <Dialog open={!!movie} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-[300px_1fr] gap-10">
          {/* Poster */}
          <div className="flex justify-center md:justify-start">
            <div className="w-full max-w-[300px] rounded-lg overflow-hidden shadow-2xl bg-muted/50">
              <img
                src={movie.poster !== "N/A" ? movie.poster : "/placeholder.svg?height=450&width=300&query=movie+poster"}
                alt={movie.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-balance">{movie.title}</DialogTitle>
            </DialogHeader>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{movie.year}</span>
              </div>
              <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full">
                <Star className="h-5 w-5 fill-accent text-accent" />
                <span className="font-bold text-lg">{movie.imdb_rating !== "N/A" ? movie.imdb_rating : "—"}</span>
              </div>
            </div>

            {/* Plot */}
            {movie.plot && movie.plot !== "N/A" && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Sinopse</h3>
                <p className="text-muted-foreground leading-relaxed text-base">{movie.plot}</p>
              </div>
            )}

            {/* Director */}
            {movie.director && movie.director !== "N/A" && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Diretor</h3>
                <p className="text-muted-foreground text-base">{movie.director}</p>
              </div>
            )}

            {/* Actors */}
            {movie.actors && movie.actors !== "N/A" && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Elenco Principal</h3>
                <p className="text-muted-foreground text-base">{movie.actors}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
