const express = require("express");
const router = express.Router();
const {
  signIn,
  signUp,
  forgotPassword,
  resendOTP,
  updatePassword,
} = require("../apiCollections/signInUp.js");
const {
  addPayment,
  getPaymentDetails,
  storeInvoice,
  UpdatePayment,
  deletePayment,
  getInvoice,
} = require("../apiCollections/paymentManipulation.js");
const {
  getPaymentDetailsForDates,
  updatePaymentStatusForDates,
  getPaymentTransaction,
} = require("../apiCollections/paymentRetrieval.js");

router.use("/signUp", signUp);
router.use("/signIn", signIn);
router.use("/resendOTP", resendOTP);
router.use("/updatePassword", updatePassword);
router.use("/forgotPassword", forgotPassword);
router.use("/addPayment", addPayment);
router.use("/UpdatePayment", UpdatePayment);
router.use("/getPaymentDetails", getPaymentDetails);
router.use("/storeInvoice", storeInvoice);
router.use("/getInvoice", getInvoice);
router.use("/getPaymentDetailsForDates", getPaymentDetailsForDates);
router.use("/updatePaymentStatusForDates", updatePaymentStatusForDates);
router.use("/getPaymentTransaction", getPaymentTransaction);
router.use("/deletePayment", deletePayment);

module.exports = router;
