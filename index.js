const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

let clientIsReady = false;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--unhandled-rejections=strict",
    ],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  clientIsReady = true;
  console.log("Client is ready!");
});

client.initialize();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/sendMessage", function (req, res) {
  if (!clientIsReady) {
    res.send("Client is not ready yet.").status(400);
    return;
  }

  let number = req.body.number;
  if (number.length === 9 && number[0] === "9") {
    number = number.slice(1);
  }
  if (number.length === 11 && number[0] === "55") {
    number = "55" + number.slice(3);
  }
  if (!number.endsWith("@c.us")) {
    number = number + "@c.us";
  }
  if (number.length === 13) {
    number = "55" + number;
  }
  if (number.length !== 15) {
    res.send("Invalid number.").status(400);
    return;
  }

  client
    .sendMessage(number, req.body.message)
    .then(() => {
      res.send("Message sent.").status(200);
    })
    .catch((err) => {
      res.send(err.message).status(500);
    });
});

const porta = 6000;
app.listen(porta, () => {
  console.log("Http server running on port " + porta);
});
