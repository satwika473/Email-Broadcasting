const mongoose = require("mongoose");

const EmailLogSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    bodyHtml: { type: String, required: true },
    recipient: { type: String, required: true },
    status: { type: String, enum: ["Sent", "Failed"], required: true },
    messageId: { type: String },
    error: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("EmailLog", EmailLogSchema);