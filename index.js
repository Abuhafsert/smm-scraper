import express from "express";
import bodyParser from "body-parser";
import { loginMailsHandler } from "./SetUp/Email/loginMail.js";
import { utils } from "./utils.js";

const app = express();
// app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(express.json());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/mails", async (req, res) => {
  const mails = await utils.emailUseFiltered({});
  if(mails.length <= 0) return res.sendStatus(404);
  res.status(200).json({ mails });
});

app.post("/mails/code", async (req, res) => {
  const { id } = req.body;
  console.log(id);
  
  const mailPage = loginMailsHandler.mailPageId[id];
  if (!mailPage) return res.sendStatus(404);

  const code = await loginMailsHandler.extractingfbSignupCode(mailPage);
  console.log(code);
  
  if (!code) return res.status(500).send("an error occured");
  res.status(200).send(code);
});

app.post("/mails", async (req, res) => {
  const { mails } = req.body;
  console.log(mails);

  const { error, id, image, success, message } =
    await loginMailsHandler.loginMail(mails || ``);
  if (error) return res.status(500).json({ error, message });
  res.status(200).json({ id, image, success });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
