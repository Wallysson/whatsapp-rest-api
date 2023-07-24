const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

let clientIsReady = false;
let qrCode;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--unhandled-rejections=strict",
    ],
  },
});

client.on("qr", (qr) => {
  qrCode = qr;
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  clientIsReady = true;
  console.log("Client is ready!");
});

client.on("disconnected", () => {
  clientIsReady = false;
  console.log("Client is disconnected!");
});

client.on("authenticated", () => {
  console.log("Client is authenticated!");
});

client.initialize();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/sendMessage", function (req, res) {
  if (!clientIsReady) {
    res.status(400).json("Client is not ready yet.");
    return;
  }

  let number = req.body.number.replace(/\D/g, "");
  let ddd = req.body.ddd.replace(/\D/g, "");
  let countryCode = req.body.countryCode.replace(/\D/g, "");

  let completeNumber = countryCode + ddd + number + "@c.us";

  client
    .sendMessage(completeNumber, req.body.message)
    .then(() => {
      res.status(200).json("Message sent.");
    })
    .catch((err) => {
      res.status(500).json(err.message);
    });
});

app.post("/sendMessageBR", function (req, res) {
  console.log("clientIsReady", clientIsReady);
  if (!clientIsReady) {
    res.status(400).json("WhatsApp não conectado, reconecte-o.");
    return;
  }

  let number = req.body.number.replace(/\D/g, "");
  let ddd = req.body.ddd.replace(/\D/g, "");

  if (number.length === 9 && number[0] === "9") {
    number = number.slice(1);
  }

  number = ddd + number;
  if (number.length === 10) {
    number = "55" + number;
  }

  if (!number.endsWith("@c.us")) {
    number = number + "@c.us";
  }

  if (number.length !== 17) {
    res.status(400).json("Invalid number.");
    return;
  }

  client
    .sendMessage(number, req.body.message)
    .then(() => {
      res.status(200).json("Message sent.");
    })
    .catch((err) => {
      res.status(500).json(err.message);
    });
});

app.get("/getStatus", function (req, res) {
  res.status(200).json(clientIsReady);
});

app.get("/generateQrCode", function (req, res) {
  if (qrCode) {
    res.status(200).json(qrCode);
  } else {
    res.status(404).json("QR Code not available.");
  }
});

const porta = 8000;
app.listen(porta, () => {
  console.log("Http server running on port " + porta);
});
