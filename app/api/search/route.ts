import { type NextRequest, NextResponse } from "next/server"

const OMDB_API_KEY = process.env.OMDB_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }

  if (!OMDB_API_KEY) {
    return NextResponse.json(
      {
        error: "OMDB API key not configured. Please add OMDB_API_KEY to environment variables.",
      },
      { status: 500 },
    )
  }

  try {
    const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`
    const response = await fetch(url)
    const data = await response.json()


    if (data.Response === "False") {
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch from OMDB" }, { status: 500 })
  }
}
