import express from "express";
import dotenv from "dotenv";

import { User } from "./model/index.js";
import { authenticateToken, generateAccessToken } from "./lib/jwt.js";
import cookieParser from "cookie-parser";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const PORT = process.env.BE_PORT || 3000;
const app = express();

const ReactAppDistPath = new URL("../front-end/dist/", import.meta.url);
const ReactAppIndex = new URL("../front-end/dist/index.html", import.meta.url);

// Parse req.body (json string) zu einem
// js object
app.use(express.json());
app.use(cookieParser());
app.use(express.static(ReactAppDistPath.pathname));
/*
 * express.static match auf jede Datei im angegebenen Ordner
 * und erstellt uns einen request handler for FREE
 * app.get("/",(req,res)=> res.sendFile("path/to/index.html"))
 * app.get("/index.html",(req,res)=> res.sendFile("path/to/index.html"))
 */
app.get("/api/status", (req, res) => {
  res.send({ status: "Ok" });
});

app.post("/api/signup", async (req, res) => {
  // Neuen User erstellen
  const { name, email } = req.body;
  const newUser = new User({ name, email });
  // user.setPassword (hash und salt setzen)
  newUser.setPassword(req.body.password);
  // user speichern
  try {
    await newUser.save();
    return res.send({
      data: {
        message: "New user created",
        user: { name, email },
      },
    });
  } catch (e) {
    console.error(e);
    if (e.name === "ValidationError") {
      return res.status(400).send({ error: e });
    }

    // Duplication Error email existiert bereits als user
    if (e.name === "MongoServerError" && e.code === 11000) {
      console.log("Redirect");
      return res.redirect("/login");
    }

    return res.status(500).send({ error: { message: "Unknown Server error" } });
  }
});
app.post("/api/login", async (req, res) => {
  const { email } = req.body;
  // finde user mit email
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(401)
      .send({ error: { message: "Email and password combination wrong!" } });
  }

  // vergleiche passwort mit user.verifyPassword
  const isVerified = user.verifyPassword(req.body.password);
  if (isVerified) {
    const token = generateAccessToken({ email });
    res.cookie("auth", token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
    return res.send({ data: { token } });
  }

  res
    .status(401)
    .send({ error: { message: "Email and password combination wrong!" } });
});

app.get("/api/verified", authenticateToken, (req, res) => {
  res.send(req.userEmail);
});

app.get("/*", (req, res) => {
  res.sendFile(ReactAppIndex.pathname);
});

app.listen(PORT, () => {
  console.log("Server running on Port: ", PORT);
});
