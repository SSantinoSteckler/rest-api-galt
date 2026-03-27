import express from "express";
import { moviesRouter } from "./routes/movie.route.js";
import { corsMiddleware } from "./middlewares/cors.js";

const PORT = process.env.PORT || 1234;

const app = express();
app.use(express.json());
app.disable("x-powered-by");
app.use(corsMiddleware());

//Todos los recursos q sean MOVIES se identifican con /movies
//Cuando accedo a /movies voy a cargar todas las rutas q tengo en moviesRouter
app.use("/movies", moviesRouter);

app.listen(PORT, () => {
  console.log("servidor listening en puerto http://localhost:", PORT);
});
