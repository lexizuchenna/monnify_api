const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");
const jwt = require("jsonwebtoken");

const { apiAuth } = require("../middlewares/index");
const User = require("../models/User");
const Account = require("../models/Account");

module.exports = {
  createAccount: async (req, res) => {
    const { name, email, password, password2, username } = req.body;

    let auth = await apiAuth();

    const uid = crypto.randomUUID().split("-")[0];

    const salt = await bcryptjs.genSalt(10);
    const hashedPwd = await bcryptjs.hash(password, salt);

    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    console.log(existingEmail, existingUser);

    const body = JSON.stringify({
      accountReference: uid,
      accountName: username,
      currencyCode: "NGN",
      contractCode: process.env.CONTRACT_CODE,
      customerEmail: email,
      customerName: name,
      getAllAvailableBanks: true,
    });

    try {
      const url = `${process.env.BASE_URL}/api/v2/bank-transfer/reserved-accounts`;

      console.log(url);

      const requestOptions = {
        method: "POST",
        body,
        headers: {
          Authorization: `Bearer ${auth}`,
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      };

      console.log(requestOptions);

      if (existingUser) {
        console.log(existingUser);
        return res.status(400).json({
          msg: "Usersname already exists, try another",
          status: "failed",
          error: "Existing user",
        });
      }

      if (existingEmail) {
        return res.json({
          msg: "Email already exists, try another",
          status: "failed",
          error: "Existing user",
        });
      }

      if (password !== password2) {
        return res.json({
          msg: "Paswords don't match",
          status: "failed",
          error: "Wrong password",
        });
      }

      fetch(url, requestOptions)
        .then((response) => response.text())
        .then(async (result) => {
          const parsed = JSON.parse(result);
          const main = parsed.responseBody;
          if (parsed.requestSuccessful === true) {
            const user = {
              name,
              username,
              email,
              password: hashedPwd,
            };
            const account = {
              accountReference: main.accountReference,
              accountName: main.accountName,
              customerEmail: main.customerEmail,
              customerName: main.customerName,
              accounts: main.accounts,
              reservationReference: main.reservationReference,
            };

            const newUser = await User.create(user);
            newUser.save();

            const newAcc = await Account.create(account);
            newAcc.save();

            return res.status(201).json({
              newUser,
              newAcc,
              msg: "Account created successfully",
              stauts: "successful",
            });
          } else {
            return res.status(500).json({
              error: "500 Internal Server Error",
              msg: "Something went wrong, try again later",
            });
          }
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({
            error,
            msg: "Something went wrong, try again",
            stauts: "failed",
          });
        });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
        msg: "Something went wrong, try again",
        stauts: "failed",
      });
    }
  },
  deleteAccount: async (req, res) => {
    const { accountReference } = req.params;
    console.log(accountReference);
    const url = `${process.env.BASE_URL}/api/v1/bank-transfer/reserved-accounts/reference/${accountReference}`;

    let auth = await apiAuth();

    try {
      const requestOptions = {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth}`,
          Accept: "*/*",
        },
      };

      fetch(url, requestOptions)
        .then((response) => response.text())
        .then(async (result) => {
          const parsed = JSON.parse(result);
          const main = parsed?.responseBody;
          if (parsed?.requestSuccessful === true) {
            const deletedUser = await User.findOneAndRemove({
              email: main.customerEmail,
            });
            const deletedAcc = await Account.findOneAndRemove({
              customerEmail: main.customerEmail,
            });

            return res.status(200).json({
              deletedUser,
              deletedAcc,
              msg: "User deleted successfully",
              stauts: "successful",
            });
          } else {
            return res.status(500).json({
              error: "500 Internal Server Error",
              msg: "Something went wrong, try again later",
              status: "failed",
            });
          }
        })
        .catch((error) => res.send(error));
    } catch (error) {
      res.send(error);
    }
  },
  getHome: async (req, res) => {
    res.sendFile(path.join(__dirname, "../public" + "/html/index.html"));
  },
  loginUser: async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });

      if (!user)
        return res.status(404).json({
          msg: "No user found!",
          error: "Not Found",
          status: "failed",
        });

      const passwordMatch = bcryptjs.compareSync(password, user.password);

      if (!passwordMatch)
        return res.status(400).json({
          msg: "Incorrect password!",
          error: "Wrong password",
          status: "failed",
        });

      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        user,
        token,
        msg: "User authenticated successfully",
        stauts: "successful",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
        msg: "Something went wrong, try again",
        stauts: "failed",
      });
    }
  },
  getUserTransactions: async (req, res) => {
    const { accountReference } = req.params;
    console.log(accountReference);
    const url = `${process.env.BASE_URL}/api/v1/bank-transfer/reserved-accounts/transactions?accountReference=${accountReference}&page=0&size=10`;

    let auth = await apiAuth();
    try {
      const requestOptions = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth}`,
          Accept: "*/*",
        },
      };

      fetch(url, requestOptions)
        .then((response) => response.text())
        .then(async (result) => {
          const parsed = JSON.parse(result);
          const main = parsed.responseBody;

          if (parsed?.requestSuccessful === true) {
            res.send(main?.content);
          } else {
            return res.status(500).json({
              error: "Internal Server Error",
              msg: "Something went wrong, try again later",
              status: "failed",
            });
          }
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({
            error,
            msg: "Something went wrong, try again",
            stauts: "failed",
          });
        });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
        msg: "Something went wrong, try again",
        stauts: "failed",
      });
    }
  },
};
