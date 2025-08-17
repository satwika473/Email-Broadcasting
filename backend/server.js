const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid"); // for unique mail IDs

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Mail Transporter Setup ---
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chakkasatwika225@gmail.com",   // replace with your Gmail
    pass: "cstj bhuk bqll dqmu"           // Gmail app password
  }
});

// --- Dummy Mail Storage (in-memory) ---
let storedMails = [];

// --- API: Send Mail ---
app.post("/send", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    let info = await transporter.sendMail({
      from: "chakkasatwika225@gmail.com",
      to,
      subject,
      text: message,
    });

    // Save in "inbox"
    const mailData = {
      id: uuidv4(),
      to,
      subject,
      message,
      date: new Date(),
    };
    storedMails.push(mailData);

    res.json({ success: true, info, mail: mailData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- API: Save Mail (drafts etc.) ---
app.post("/saveMail", (req, res) => {
  const mailData = { id: uuidv4(), ...req.body, date: new Date() };
  storedMails.push(mailData);
  res.json({ success: true, mail: mailData });
});

// --- API: Get All Mails ---
app.get("/mails", (req, res) => {
  res.json(storedMails);
});

// --- API: Delete Mail ---
app.delete("/api/mails/:id", (req, res) => {
  const mailId = req.params.id;  // keep as string
  const index = storedMails.findIndex(mail => mail.id === mailId);

  if (index !== -1) {
    storedMails.splice(index, 1);
    return res.json({ success: true, message: "Mail deleted successfully" });
  }

  res.json({ success: false, message: "Mail not found" });
});

// --- API: Search Mail (subject, recipient, or message) ---
app.get("/search", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.json(storedMails);
  }

  const results = storedMails.filter(mail =>
    mail.subject.toLowerCase().includes(query.toLowerCase()) ||
    mail.to.toLowerCase().includes(query.toLowerCase()) ||
    mail.message.toLowerCase().includes(query.toLowerCase())
  );

  res.json(results);
});

// --- Start Server ---
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
