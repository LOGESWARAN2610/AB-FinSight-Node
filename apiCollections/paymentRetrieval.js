const { dataBase } = require("../config/db.config.js");
require("dotenv").config();
const fs = require("fs");
const { sendRequestEmail } = require("./sendEmail.js");
const paymentDetailsCollection = dataBase.collection("PaymentDetails");
const paymentTransactionCollection = dataBase.collection("PaymentTransaction");

const getPaymentDetailsForDates = async ({ body: params }, res) => {
  try {
    let { eDate, sDate, userId, isAdmin = false } = params;

    let query = [
      {
        $match: {
          date: {
            $gte: sDate,
            $lte: eDate,
          },
        },
      },
    ];
    if (!isAdmin) {
      query.unshift({
        $match: {
          userId,
        },
      });
    }
    const result = paymentDetailsCollection.aggregate(query);
    const resultArray = await result.toArray();

    res.json(resultArray);
  } catch (err) {
    res.status(500);
    console.log(err["message"]);
    res.send(err["message"]);
  }
};

const updatePaymentStatusForDates = async ({ body: params }, res) => {
  try {
    const { status, eDate, sDate, amount, requestedBy, notes } = params;

    if (status === "Requested") {
      paymentTransactionCollection.insertOne({
        from: sDate,
        to: eDate,
        status: status,
        amount,
        requestedBy,
        requestedOn: new Date(),
        notes,
      });
      sendRequestEmail({ eDate, sDate, amount, notes });
    } else if (status === "Paid") {
      paymentTransactionCollection.updateMany(
        {
          from: {
            $gte: sDate,
            $lte: sDate,
          },
          to: {
            $gte: eDate,
            $lte: eDate,
          },
        },
        { $set: { status: status, paidOn: new Date() } }
      );
    }

    const result = paymentDetailsCollection.updateMany(
      {
        date: {
          $gte: sDate,
          $lte: eDate,
        },
      },
      { $set: { settlementStatus: status } }
    );
    res.json({ status: "Success" });
  } catch (err) {
    res.status(500);
    console.log(err["message"]);
    res.send(err["message"]);
  }
};

const getPaymentTransaction = async ({ body: params }, res) => {
  try {
    // const { eDate, sDate } = params;
    const result = paymentTransactionCollection.find({});

    const resultArray = await result.toArray();
    res.json(resultArray);
  } catch (err) {
    res.status(500);
    console.log(err["message"]);
    res.send(err["message"]);
  }
};

module.exports = {
  getPaymentDetailsForDates,
  updatePaymentStatusForDates,
  getPaymentTransaction,
};
