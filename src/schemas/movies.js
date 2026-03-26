import z from "zod";

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().positive().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10),
  poster: z.string().url({
    message: "Poster must be a valid URL",
  }),
  genre: z.array(z.string()),
});

export function validatePartialMovie(object) {
  return movieSchema.partial().safeParse(object);
}

export function validateMovie(object) {
  return movieSchema.safeParse(object);
}
