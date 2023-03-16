const express = require("express");
const path = require("path");
const connectToMongoDB = require("./connect");
const URL = require("./models/url");
const urlRoute = require("./routes/url");
const staticrouter = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const app = express();
const port = 8001;
const cookieParser = require("cookie-parser");
const { restrictToLoggedUserOnly, checkAuth } = require("./middleware/auth");
connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
  .then(() => {
    console.log("connected ");
  })
  .catch(() => {
    console.log("not connected ");
  });
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// to parse the incomming body
app.use(express.json());
// to parde  the form  data
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use("/url", restrictToLoggedUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/",checkAuth, staticrouter);
app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
  console.log(entry.redirectURL);
});

app.listen(port, () => {
  console.log("running ");
});
