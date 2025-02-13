import routes from "./routes/router.js";
import pkj from "../package.json" assert { type: "json" };
import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());
app.use(express.json({ limit: "10mb" }));

app.use(morgan("dev"));

app.use(cors());

app.get("/", (req, res) => {
    res.json({
        name: pkj.name,
        author: pkj.author,
        version: pkj.version,
        description: pkj.description,
    });
});

routes(app);

export default app;
