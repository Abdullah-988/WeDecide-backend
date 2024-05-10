import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import routes from "./routes/allRoutes";

const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: [process.env.FRONTEND_URL!],
  })
);

app.get("/", (req, res) => {
  return res.send("Hello");
});

app.use("/", routes);

app.listen(port, () => {
  console.log(`App is listening to port: ${port}`);
});
