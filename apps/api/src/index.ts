import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import routes from "./routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
