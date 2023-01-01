const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema(
  {
    accountReference: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    transactionReference: {
      type: String,
      required: true,
    },
    paymentReference: {
      type: String,
      required: true,
    },
    paidOn: {
      type: Date,
      required: true,
    },
    paymentDescription: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentSourceInformation: {
      type: [],
      required: true,
    },
    destinationAccountInformation: {
      type: [],
      required: true,
    },
    settlementAmount: {
      type: String,
    },
    amountPaid: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
