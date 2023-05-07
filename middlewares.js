import axios from "axios";

const AuthPantalla2 = async (req, res, next) => {
  console.log("Middleware");

  if (req.session.access_token) {
    console.log("Tengo token");
    const user = await axios
      .get("http://localhost:3000/user", {
        headers: {
          Authorization: `Bearer ${req.session.access_token}`,
        },
      })
      .then((res) => {
        return res.data;
      });

    if (user.roles.some((rol) => rol.name == "Pantalla2")) {
      console.log("next");
      next();
    } else {
      res.render("denied");
    }
  } else {
    res.render("denied");
  }
};

const AuthPantalla1 = async (req, res, next) => {
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

    if (user.roles.some((rol) => rol.name == "Pantalla1")) {
      next();
    } else {
      res.render("denied");
    }
  } else {
    res.render("denied");
  }
};

export const Middlewares = {
  AuthPantalla2,
  AuthPantalla1,
};
