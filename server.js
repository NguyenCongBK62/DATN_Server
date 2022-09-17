require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { errorHandle } = require("./middlewares/errorHandle");
const cors = require("cors");
const PORT = process.env.PORT || 3001;

const app = express();
// app.use(
//   cors({
//     credentials: true,
//     origin: [
//       "http://localhost:8000",
//       // "http://localhost:8888",
//       // "http://localhost:8088",
//     ],
//   }),
// );
app.use(cors());
app.use(bodyParser.json());
const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");
const adminUmatRoute = require("./routes/adminumat");
app.use("/users", userRoute);
app.use("/admin", adminRoute);
app.use("/adminUmat", adminUmatRoute);

app.all("*", (req, res, next) => {
  const err = new Error("Không thể tìm thấy tài nguyên !");
  err.statusCode = 404;
  next(err);
});
app.use(errorHandle);
app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});
