const router = require("express").Router();
const { getChatMessages, sendChatMessage } = require("../controllers/chat.controller");

router.route("/").get(getChatMessages).post(sendChatMessage);

module.exports = router;
