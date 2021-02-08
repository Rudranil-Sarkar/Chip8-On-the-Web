const express = require("express");
const fs = require("fs");
const process = require("process");

const app = new express();

app.use(express.static("./public"));
app.use(express.json());

app.get("/api/:GameName", (req, res) => {
  if (req.params.GameName === "sound") {
    fs.readFile(`./sound/beep-02.mp3`, (err, data) => {
      res.send(data);
    });
    return;
  }
  fs.readFile(`./roms/${req.params.GameName}`, (err, data) => {
    if (err) {
      console.log("err reading the game file");
      res.end();
      return;
    }
    res.json({ bytes: data });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is listening on port " + port);
});
