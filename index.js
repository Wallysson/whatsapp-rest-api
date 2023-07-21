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
});

client.initialize();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/sendMessage", function (req, res) {
  if (!clientIsReady) {
    res.send("Client is not ready yet.").status(400);
    return;
  }

  let number = req.body.number.replace(/\D/g, "");
  let ddd = req.body.ddd.replace(/\D/g, "");
  let countryCode = req.body.countryCode.replace(/\D/g, "");

  let completeNumber = countryCode + ddd + number + "@c.us";

  client
    .sendMessage(completeNumber, req.body.message)
    .then(() => {
      res.send("Message sent.").status(200);
    })
    .catch((err) => {
      res.send(err.message).status(500);
    });
});

app.post("/sendMessageBR", function (req, res) {
  if (!clientIsReady) {
    res.send("Client is not ready yet.").status(400);
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

app.get("/getStatus", function (req, res) {
  if (clientIsReady) {
    res.status(200).send(clientIsReady);
  } else {
    res.status(503).send(clientIsReady);
  }
});

app.get("/generateQrCode", function (req, res) {
  if (qrCode) {
    res.status(200).send(qrCode);
  } else {
    res.status(404).send("QR Code not available.");
  }
});

const porta = 8000;
app.listen(porta, () => {
  console.log("Http server running on port " + porta);
});
