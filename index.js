const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

const app = express();
const port = process.env.PORT || 3000;

let client;
let qrCodeDataUrl = "";

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
    res.send(`
      <html>
        <body>
          <h1>QR Code</h1>
          <img src="${qrCodeDataUrl}" alt="QR Code">
          <p>Scan this QR code to authenticate with WhatsApp.</p>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <html>
        <body>
          <h1>Generating QR Code...</h1>
          <p>QR Code is being generated. Please wait.</p>
          <script>
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
