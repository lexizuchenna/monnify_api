const router = require("express").Router();

const {
  createAccount,
  getHome,
  loginUser,
  getUserTransactions,
  deleteAccount,
} = require("../controllers/api");

router
    .route("/create-account")
    .post(createAccount)
    .get(getHome);
router
    .route("/login-user")
    .post(loginUser);
router
  .route("/get-user-transactions/:accountReference")
  .get(getUserTransactions);
router
    .route("/delete-account/:accountReference")
    .delete(deleteAccount);

module.exports = router;
