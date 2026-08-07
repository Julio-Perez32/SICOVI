const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { getNotifications, markAsRead } = require("../controller/notification.controller");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);

module.exports = router;
