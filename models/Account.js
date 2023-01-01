const mongoose = require("mongoose");

const AccountSchema = mongoose.Schema(
  {
    accountReference: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    accounts: {
      type: [],
      required: true,
    },
    reservationReference: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
