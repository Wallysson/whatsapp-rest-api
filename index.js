const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const app = express();
const fs = require("fs");
const isValidPhoneNumber = require("./helpers/is-valid-phone-number");

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
      res.status(200).json("Mensagem enviada.");
    })
    .catch((err) => {
      res.status(500).json(err.message);
    });
});

app.post("/sendMessageBR", function (req, res) {
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
    res.status(400).json("Número inválido.");
    return;
  }

  client
    .sendMessage(number, req.body.message)
    .then(() => {
      res.status(200).json("Mensagem enviada.");
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
    res.status(404).json("QR Code não disponível.");
  }
});

app.post("/sendPDF", fileUpload(), async (req, res) => {
  try {
    if (!req.files) {
      console.log("chegou aqui né");
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    let number = req.query.number.replace(/\D/g, "");
    let ddd = req.query.ddd.replace(/\D/g, "");

    const formattedNumber = isValidPhoneNumber(ddd, number);
    if (!formattedNumber) {
      return res.status(400).json({ error: "Número inválido." });
    }

    const file = req.files.file;
    const nomeArquivo = file.name;

    await file.mv(`./uploads/${nomeArquivo}`);

    const media = MessageMedia.fromFilePath(`./uploads/${nomeArquivo}`);

    client
      .sendMessage(formattedNumber, media)
      .then(() => {
        fs.unlinkSync(`./uploads/${nomeArquivo}`);
        res.status(200).json({ message: "Arquivo enviado com sucesso." });
      })
      .catch((err) => {
        console.error("Erro ao enviar arquivo:", err);
        res.status(500).json({ error: "Erro ao enviar arquivo." });
      });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Um erro ocorreu." });
  }
});

const porta = 8000;
app.listen(porta, () => {
  console.log("Http server running on port " + porta);
});
