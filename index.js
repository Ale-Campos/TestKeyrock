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

//Login

app.get("/log-out", (req, res) => {
  req.session.access_token = undefined;
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    const result = await axios
      .post(
        "http://localhost:3000/oauth2/token",
        {
          grant_type: "password",
          username,
          password,
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
      });
    console.log(result);
    req.session.access_token = result.access_token;
    console.log(req.session.access_token);

    req.session.api_token = await getApiToken(
      username,
      password,
      req.session.access_token
    );
    res.redirect("/welcome");
  } catch (error) {
    res.render("login");
  }
});

async function getApiToken(name, password, token) {
  const result = await axios
    .post(
      "http://localhost:3000/v1/auth/tokens",
      {
        name,
        password,
      },
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    )
    .catch((error) => {
      throw new Error();
    });
  console.log("Apitoken:" + result.headers["x-subject-token"]);
  return result.headers["x-subject-token"];
}

function buildHeader() {
  const key =
    "bcc49c35-eb52-4e6e-9523-850f0309e8cd:e4f909fc-9a91-4002-8116-94f4b536744d";
  const base64 = new Buffer(key).toString("base64");
  // const base64 = Buffer.from(key, "base64");
  return "Basic " + base64;
}

//Recursos

app.get("/welcome", async (req, res) => {
  if (req.session.access_token) {
    const user = await axios
      .get("http://localhost:3000/user", {
        headers: {
          Authorization: `Bearer ${req.session.access_token}`,
        },
      })
      .then((res) => {
        return res.data;
      });

    console.log(user);
    res.render("welcome", { user });
  } else {
    res.redirect("login");
  }
});
app.get("/pantallaUno", Middlewares.AuthPantalla1, (req, res) => {
  res.render("pantallaUno");
});

app.get("/pantallaDos", Middlewares.AuthPantalla2, (req, res) => {
  res.render("pantallaDos");
});

app.get("/create-user", (req, res) => {
  res.render("create");
});

app.post("/create-user", async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.session.access_token);
  await axios
    .post(
      "http://localhost:3000/v1/users",
      {
        username,
        email,
        password,
      },
      {
        headers: {
          "X-Auth-token": req.session.access_token,
        },
      }
    )
    .then((res) => {
      console.log(res.data);
      res.send("Usuario creado");
    })
    .catch((error) => {
      console.log(error.response.data);
      res.send("Error");
    });
});

//Server Up
app.listen(2000, () => {
  console.log("El servidor está funcionando en el puerto 2000");
});
