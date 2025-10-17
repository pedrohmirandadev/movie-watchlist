"use client"

import { Eye, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Movie } from "./movie-watchlist"

interface MovieTableProps {
  movies: Movie[]
  onToggleWatched: (id: string) => void
  onDelete: (id: string) => void
  onRowClick: (movie: Movie) => void
}

export function MovieTable({ movies, onToggleWatched, onDelete, onRowClick }: MovieTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12"></TableHead>
            <TableHead>Título</TableHead>
            <TableHead className="hidden md:table-cell">Diretor</TableHead>
            <TableHead className="hidden sm:table-cell">Ano</TableHead>
            <TableHead>Nota IMDB</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movies.map((movie) => (
            <TableRow key={movie.id} className="cursor-pointer" onClick={() => onRowClick(movie)}>
              <TableCell>
                <img
                  src={movie.poster !== "N/A" ? movie.poster : "/placeholder.svg?height=60&width=40&query=movie+poster"}
                  alt={movie.title}
                  className="w-10 h-14 object-cover rounded"
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-semibold">{movie.title}</p>
                  {movie.watched && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Assistido
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {movie.director !== "N/A" ? movie.director : "—"}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">{movie.year}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-semibold">{movie.imdb_rating !== "N/A" ? movie.imdb_rating : "—"}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleWatched(movie.id)
                    }}
                    title={movie.watched ? "Marcar como não visto" : "Marcar como visto"}
                  >
                    <Eye className={`h-4 w-4 ${movie.watched ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(movie.id)
                    }}
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
