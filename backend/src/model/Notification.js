const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    tipo: {
      type: String,
      enum: ["stock_bajo", "sin_stock"],
      required: true,
    },
    mensaje: {
      type: String,
      required: true,
    },
    leida: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ leida: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
