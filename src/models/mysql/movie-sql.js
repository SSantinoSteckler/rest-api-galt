import mysql from "mysql2/promise";

const config = {
  host: "localhost",
  user: "root",
  port: "3306",
  password: "",
  database: "movies_database",
};

const connection = await mysql.createConnection(config);

export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
      const lowerCaseGenre = genre.toLowerCase();

      const [genres] = await connection.query(
        "SELECT id FROM genre WHERE LOWER(name) = ?;",
        [lowerCaseGenre],
      );

      if (genres.length === 0) return [];

      const [{ id }] = genres;

      const [movieIds] = await connection.query(
        "SELECT movie_id FROM movie_genres WHERE genre_id = ?;",
        [id],
      );

      if (movieIds.length === 0) return [];

      const ids = movieIds.map((row) => row.movie_id);

      const [movies] = await connection.query(
        `
      SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id
      FROM movie
      WHERE id IN (?);
      `,
        [ids],
      );

      return movies;
    }

    const [movies] = await connection.query(
      "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(ID) id FROM movie;",
    );

    return movies;
  }

  static async getById({ id }) {
    const [movies] = await connection.query(
      `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) AS id FROM movie WHERE id = UUID_TO_BIN(?);`,
      [id],
    );

    if (movies.length === 0) return null;

    return movies[0];
  }

  static async create({ input }) {
    const {
      genre: genreInput,
      title,
      year,
      duration,
      director,
      rate,
      poster,
    } = input;

    const [uuidResult] = await connection.query("SELECT UUID() AS uuid;");
    const [{ uuid }] = uuidResult;

    try {
      await connection.query(
        `
      INSERT INTO movie (id, title, year, director, duration, poster, rate)
      VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);
      `,
        [uuid, title, year, director, duration, poster, rate],
      );
    } catch (error) {
      console.error(error);
      throw new Error("Error creating movie");
    }

    const [movies] = await connection.query(
      `
    SELECT
      title,
      year,
      director,
      duration,
      poster,
      rate,
      BIN_TO_UUID(id) AS id
    FROM movie
    WHERE id = UUID_TO_BIN(?);
    `,
      [uuid],
    );

    return movies[0];
  }
  static async delete({ id }) {
    const [result] = await connection.query(
      `DELETE FROM movie WHERE id = UUID_TO_BIN(?);`,
      [id],
    );

    if (result.affectedRows === 0) return false;

    return true;
  }

  static async update({ id, input }) {
    const fields = [];
    const values = [];

    for (const key of Object.keys(input)) {
      fields.push(`${key} = ?`);
      values.push(input[key]);
    }

    if (fields.length === 0) return null;

    const query = `
    UPDATE movie
    SET ${fields.join(", ")}
    WHERE id = UUID_TO_BIN(?);
  `;

    values.push(id);

    const [result] = await connection.query(query, values);

    if (result.affectedRows === 0) return null;

    const [movies] = await connection.query(
      `
    SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) AS id
    FROM movie
    WHERE id = UUID_TO_BIN(?);
    `,
      [id],
    );

    return movies[0];
  }
}
