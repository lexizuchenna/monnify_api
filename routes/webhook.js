const router = require("express").Router();

const { receiveTransactionData } = require("../controllers/webhooks");

router.route("/receive-transaction-data").post(receiveTransactionData);

module.exports = router;
