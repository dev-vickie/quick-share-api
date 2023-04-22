const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");
const File = require("./models/fileModel");

const app = express();
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: process.env.MULTER_DESTINATION_URL });
const PORT = process.env.PORT || 3000;


mongoose.connect(process.env.DATABASE_URL);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
  };
  if (req.body.password != null && req.body.password !== "") {
    fileData.password = await bcrypt.hash(req.body.password, 10);
  }

  const file = await File.create(fileData);
  res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}` });
});

app.route("/file/:id").get( handleDownload).post( handleDownload);

async function handleDownload(req, res) {
    const file = await File.findById(req.params.id);
  
    if (file.password != null) {
      if (req.method === "GET") {
        res.render("password", { id: req.params.id, error: req.query.error });
        return;
      } else if (req.method === "POST" && req.body.password == null) {
        res.redirect(`/file/${req.params.id}/password?error=true`);
        return;
      }
    }
  
    if (file.password != null && !(await bcrypt.compare(req.body.password, file.password))) {
      res.render("password", { id: req.params.id, error: true });
      return;
    }
  
    file.downloadCount++;
    await file.save();
  
    res.download(file.path, file.originalName);
  }
  


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
