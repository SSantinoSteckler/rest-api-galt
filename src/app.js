import express from "express";
import movies from "../movies.json" with { type: "json" };
import crypto from "crypto";
import { validateMovie, validatePartialMovie } from "./schemas/movies.js";
import cors from "cors";

const PORT = process.env.PORT || 1234;

const app = express();
app.use(express.json());
app.disable("x-powered-by");
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        "http://localhost:8080",
        "http://localhost:1234",
        "https://movies.com",
        "https://midu.dev",
      ];

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

//Todos los recursos q sean MOVIES se identifican con /movies

//metodos normales : GET/HEAD/POST
//metodos complejos: PUT/PATCH/DELETE

//CORS PRE-Flight
//OPTIONS

app.get("/movies", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");

  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase()),
    );
    return res.json(filteredMovies);
  }

  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  // Path to regex
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);

  res.status(404).json({ message: "Movie not found" });
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: JSON.parse(result.error.message),
    });
  }

  //Esto no seria rest porque estamos guardando el estado de la
  // aplicacion en memoria

  const newMovie = {
    id: crypto.randomUUID(), //UUID V4
    ...result.data,
  };

  movies.push(newMovie);

  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const { id } = req.params;

  const result = validatePartialMovie(req.body);

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1)
    return res.status(404).json({
      message: "Movie not found",
    });

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie);
});

app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({
      message: "Movie not found",
    });
  }

  movies.splice(movieIndex, 1);

  return res.json({ message: "Movie deleted" });
});

app.options("/movies/:id", (req, res) => {
  const origin = req.header("origin");
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Methods",
      "GET",
      "PUT",
      "POST",
      "PATCH",
      "DELETE",
    );
  }

  res.send(200);
});

app.listen(PORT, () => {
  console.log("servidor listening en puerto http://localhost:", PORT);
});
