const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const email = require("../constants/email");
const sendMail = require("../middlewares/nodemailer");

module.exports = {
  receiveTransactionData: async (req, res) => {
    const data = req.payload;
    const headers = Object.values(req.headers);
    console.log(req.payload)
    console.log(headers[2])

    try {
      
      if (
        headers[2] === "35.242.133.146" &&
        data &&
        data?.eventType === "SUCCESSFUL_TRANSACTION"
      ) {
        const transactionObj = {
          accountReference: data.eventData.product.reference,
          customerEmail: data.customer.email,
          transactionReference: data.transactionReference,
          paymentReference: data.paymentReference,
          paidOn: new Date(data.paidOn),
          paymentDescription: data.paymentDescription,
          paymentMethod: data.paymentMethod,
          paymentSourceInformation: data.paymentSourceInformation[0],
          destinationAccountInformation: data.destinationAccountInformation,
          settlementAmount: data.settlementAmount,
          amountPaid: data.amountPaid,
        };

        const newTransactionData = await Transaction.create(transactionObj);

        newTransactionData.save();

        const account = await Account.findOne({
          accountReference: transactionObj.accountReference,
        });

        const accontObj = {
          amount: account.amount + transactionObj.settlementAmount,
        };

        const updatedAcc = await Account.findOneAndUpdate(
          {
            accountReference: transactionObj.accountReference,
          },
          accontObj,
          { new: true }
        );

        sendMail(
          "Automated Message",
          `${data?.eventType}`,
          "lextechspec@gmail.com",
          email(data?.eventType, data?.customer?.name, data?.settlementAmount)
        );

        res.status(201).json(updatedAcc);
      }
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  },
};
