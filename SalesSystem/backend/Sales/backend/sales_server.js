const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api/products", require("./routes/products"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});