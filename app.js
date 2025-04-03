require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const port = process.env.PORT;

const app = express();

// config JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cors
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://reactgram-frontend-k7kzf77eb-lucas-projects-a0d6a70a.vercel.app",
    ],
  })
);

//uploads directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// db connection
require("./config/db.js");

// routes
const routes = require("./routes/Router.js");

app.use(routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
