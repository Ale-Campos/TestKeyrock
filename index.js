import express from "express";
import axios from "axios";
import session from "express-session";
import { Middlewares } from "./middlewares.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

//Handle accesscode
app.get("/access-code", async (req, res) => {
  if (req.session.access_token) {
    res.redirect("/welcome");
  } else {
    const accessCode = req.query.code;
    console.log("ACCESSCODE");
    console.log(accessCode);

    const result = await axios
      .post(
        "http://localhost:3000/oauth2/token",
        {
          grant_type: "authorization_code",
          code: accessCode,
          redirect_uri: "http://localhost:2000/access-code",
        },
        {
          headers: {
            Authorization: buildHeader(),
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log(error.response.data);
      });
    console.log(result);

    req.session.access_token = result.access_token;
    res.redirect("/welcome");
  }
});

function buildHeader() {
  const key =
    "bcc49c35-eb52-4e6e-9523-850f0309e8cd:e4f909fc-9a91-4002-8116-94f4b536744d";
  const base64 = new Buffer(key).toString("base64");
  // const base64 = Buffer.from(key, "base64");
  return "Basic " + base64;
}

app.get("/welcome", async (req, res) => {
  const user = await axios
    .get("http://localhost:3000/user", {
      headers: {
        Authorization: `Bearer ${req.session.access_token}`,
      },
    })
    .then((res) => {
      return res.data;
    });

  res.render("welcome", { user });
});

app.get("/log-out", (req, res) => {
  req.session.access_token = undefined;
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

//Recursos
app.get("/pantallaUno", Middlewares.AuthPantalla1, (req, res) => {
  res.render("pantallaUno");
});
app.get("/pantallaDos", Middlewares.AuthPantalla2, (req, res) => {
  res.render("pantallaDos");
});

app.listen(2000, () => {
  console.log("El servidor está funcionando en el puerto 2000");
});
