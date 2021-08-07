const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const interfaces = require("os").networkInterfaces();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Peter Mortensen - Stack Overflow
const getIPAddress = () => {
  for (let devName in interfaces) {
    const iface = interfaces[devName];

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      )
        return alias.address;
    }
  }
  return "localhost";
};

app.get("/", (req, res) => {
  res.contentType("html");
  res.send(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>My sender</title>
      </head>
      <body>
        <form action="/" method="post" enctype="multipart/form-data">
          <input type="file" name="files" multiple />
          <input type="submit" name="submit" />
        </form>
      </body>
    </html>`
  );
});

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, callback) {
    callback(
      null,
      file.originalname +
        "-" +
        crypto.randomBytes(5).toString("hex") +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
}).array("files");

app.post("/", upload, (req, res, next) => {
  res.json({ success: true });
});

const PORT = 9000;

app.listen(PORT, "0.0.0.0", () =>
  console.log(`sender live at http://${getIPAddress()}:${PORT}`)
);
