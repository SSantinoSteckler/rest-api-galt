// import { MovieModel } from "../models/local-file-system/movie.model.local.js";
import { validateMovie, validatePartialMovie } from "../schemas/movies.js";
import { MovieModel } from "../models/mysql/movie-sql.js";

export class MovieController {
  static async getAll(req, res) {
    const { genre } = req.query;
    const movies = await MovieModel.getAll({ genre });

    //El controlador decidira que es lo q renderiza
    if (movies) return res.json(movies);

    res.status(500).json({ message: error.message });
  }

  static async getById(req, res) {
    const { id } = req.params;

    const movie = await MovieModel.getById({ id });
    if (movie) return res.json(movie);

    res.status(404).json({ message: "Movie not found" });
  }

  static async create(req, res) {
    const result = validateMovie(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: JSON.parse(result.error.message),
      });
    }

    const newMovie = await MovieModel.create({ input: result.data });

    res.status(201).json(newMovie);
  }

  static async update(req, res) {
    const { id } = req.params;

    const result = validatePartialMovie(req.body);

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const updateMovie = MovieModel.update({ id: id, input: result.data });

    return res.json(updateMovie);
  }

  static async delete(req, res) {
    const { id } = req.params;

    const result = await MovieModel.delete({ id });

    if (result === false) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    return res.json({ message: "Movie deleted" });
  }
}
