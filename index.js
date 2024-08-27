const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const cors = require("cors");
const qrcode = require("qrcode");

const app = express();
const port = process.env.PORT || 3000;

let client;
let qrCodeDataUrl = "";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bot is running");
});

// Endpoint untuk webhook
app.post("/webhook", async (req, res) => {
  if (!client) {
    client = new Client({
      authStrategy: new LocalAuth(),
    });

    client.on("qr", async (qr) => {
      try {
        qrCodeDataUrl = await qrcode.toDataURL(qr);
      } catch (error) {
        console.error("Gagal menghasilkan QR code:", error);
      }
    });

    client.on("ready", () => {
      console.log("Client is ready!");
    });

    client.on("message", async (msg) => {
      try {
        if (msg.hasMedia) {
          try {
            const media = await msg.downloadMedia();
            if (media) {
              if (msg.body.toLowerCase().includes("!sticker")) {
                await client.sendMessage(msg.from, media, {
                  sendMediaAsSticker: true,
                  stickerAuthor: "Exoream",
                });
              } else if (msg.body.toLowerCase().includes("!gif")) {
                await client.sendMessage(msg.from, media, {
                  sendVideoAsGif: true,
                  stickerAuthor: "Exoream",
                });
              }
            }
          } catch (error) {
            console.error("Gagal mengunduh media:", error);
            await client.sendMessage(
              msg.from,
              "Maaf, terjadi kesalahan saat mengunduh media. Coba lagi."
            );
          }
        } else if (
          msg.body.toLowerCase() === "oi" ||
          msg.body.toLowerCase() === "halo" ||
          msg.body.toLowerCase() === "hilal"
        ) {
          client.sendMessage(
            msg.from,
            "Hai! Saya sedang sibuk saat ini, tapi akan membalas pesan Anda segera."
          );
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });

    client.initialize();
  }

  res.status(200).send("Webhook received");
});

app.get("/qr", (req, res) => {
  if (qrCodeDataUrl) {
    try {
      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
      const imgBuffer = Buffer.from(base64Data, 'base64');
  
      res.setHeader('Content-Type', 'image/png');
      res.send(imgBuffer);
    } catch (error) {
      console.error("Error generating QR code image:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(404).send("QR Code not available");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
