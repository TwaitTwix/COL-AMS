import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";

const app = express();
const currentDir = path.dirname(fileURLToPath(import.meta.url));

app.disable("x-powered-by");
if(process.env.VERCEL==='1')app.set('trust proxy',1);
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.resolve(currentDir, "../public")));
app.use("/api", apiRouter);
app.get('/events/:eventId', (_req,res)=>res.sendFile(path.resolve(currentDir,'../public/index.html')));
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
