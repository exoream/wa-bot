const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
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
          // Jika pesan mengandung kata "!sticker"
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
    }
    // Respon untuk pesan teks "!ping"
    else if (
      msg.body.toLowerCase() === "oi" ||
      msg.body.toLowerCase() === "halo"
    ) {
      client.sendMessage(msg.from, "Hai! Saya sedang sibuk saat ini, tapi akan membalas pesan Anda segera.");
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
});

client.initialize();
