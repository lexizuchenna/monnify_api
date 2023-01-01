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
    const data = req.body;
    const headers = Object.values(req.headers);
    // console.log(email(data?.eventType, data?.customer?.name, data?.settlementAmount))

    try {
      
      if (
        headers[2] === "35.242.133.146" &&
        data &&
        data?.eventType === "SUCCESSFUL_TRANSACTION"
      ) {
        const transactionObj = {
          accountReference: data.eventData.product.reference,
          customerEmail: data.eventData.customer.email,
          transactionReference: data.eventData.transactionReference,
          paymentReference: data.eventData.paymentReference,
          paidOn: new Date(data.eventData.paidOn),
          paymentDescription: data.eventData.paymentDescription,
          paymentMethod: data.eventData.paymentMethod,
          paymentSourceInformation: data.eventData.paymentSourceInformation[0],
          destinationAccountInformation: data.eventData.destinationAccountInformation,
          settlementAmount: data.eventData.settlementAmount,
          amountPaid: data.eventData.amountPaid,
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
          email(data?.eventType, data?.eventData.customer?.name, data?.settlementAmount)
        );

        console.log(updatedAcc)
        res.status(201).json(updatedAcc);
      }
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  },
};
