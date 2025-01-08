const express = require("express");
const router = express.Router();
const { dataBase } = require("../config/db.config.js");
const bcrypt = require("bcrypt");

const userDetailsCollection = dataBase.collection("UserDetails");

const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 5);
  } catch (error) {
    throw error;
  }
};
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw error;
  }
};
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const signIn = async ({ body: params }, res) => {
  try {
    const userDetailsCollection = dataBase.collection("UserDetails");
    let { emailId, password } = params;

    const result = await userDetailsCollection.findOne({ emailId, password });
    res.json(result || {});
  } catch (err) {
    res.status(500);
    res.send(err["message"]);
  }
};

const signUp = async ({ body: params }, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      emailId,
      password = "Cool@111",
    } = params;

    const OTP = generateOTP();
    console.log("OTP", OTP);

    const result = await userDetailsCollection.insertOne({
      firstName,
      lastName,
      phoneNumber,
      emailId,
      password,
      OTP,
    });

    res.json({ OTP } || {});
  } catch (err) {
    res.status(500);
    res.send(err["message"]);
  }
};

const resendOTP = async ({ body: params }, res) => {
  try {
    const { emailId } = params;
    const OTP = generateOTP();

    const result = await userDetailsCollection.updateOne(
      { emailId },
      { $set: { OTP } }
    );

    res.json({ OTP } || {});
  } catch (err) {
    res.status(500);
    res.send(err["message"]);
  }
};

const updatePassword = async ({ body: params }, res) => {
  try {
    const { emailId, newPassword: password } = params;
    const result = await userDetailsCollection.updateOne(
      { emailId },
      { $set: { password } }
    );
    res.json({ status: "Password Saved Successfully." } || {});
  } catch (err) {
    res.status(500);
    res.send(err["message"]);
  }
};

const forgotPassword = async ({ body: params }, res) => {
  try {
    const { emailId, password } = params;

    res.json(
      (await userDetailsCollection.findOne({ emailId, password })) || {}
    );
  } catch (err) {
    res.status(500);
    res.send(err["message"]);
  }
};

module.exports = { signIn, signUp, resendOTP, updatePassword, forgotPassword };
