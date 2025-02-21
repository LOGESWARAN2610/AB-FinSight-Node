const { ObjectId } = require("mongodb");
const { dataBase } = require("../config/db.config.js");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const paymentDetailsCollection = dataBase.collection("PaymentDetails");

const getPaymentDetails = async ({ body: params }, res) => {
  try {
    let { date, userId, isAdmin = false } = params;
    let query = [
      // {
      //   $addFields: {
      //     datePart: {
      //       $dateToString: {
      //         format: "%d/%m/%Y",
      //         date: { $toDate: "$date" },
      //       },
      //     },
      //   },
      // },
      {
        $match: {
          date,
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
    const resultCursor = paymentDetailsCollection.aggregate(query);
    const resultArray = await resultCursor.toArray();
    res.json(resultArray);
  } catch (err) {
    res.status(500);
    res.send(err["message"]);
  }
};
function trimObjectValues(obj) {
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].trim();
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      trimObjectValues(obj[key]); // Recursively trim nested objects
    }
  }
  return obj;
}
const addPayment = async ({ body: params }, res) => {
  try {
    params = trimObjectValues(params);

    params["invoiceFiles"] = await storeInvoice({
      body: {
        file: params["invoiceFiles"].filter(({ isSaved }) => !isSaved),
        isReturn: true,
      },
    });
    const { date } = params;
    params["addedDate"] = date.split("-").reverse().join("/");
    const result = await paymentDetailsCollection.insertOne(params);
    res.json({ status: "Success" });
  } catch (err) {
    console.log("addPayment ===> ", err["message"]);

    res.status(500);
    res.send(err["message"]);
  }
};
const UpdatePayment = async ({ body: params }, res) => {
  try {
    const { _id, invoiceFiles, amount, purpose, paidBy } = params;

    try {
      const result = await paymentDetailsCollection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: { amount, purpose, paidBy, invoiceFiles } }
      );
    } catch (error) {
      console.error("Error form UpdatePayment ====> ", error);
    }

    res.json({ status: "Success" });
  } catch (err) {
    res.status(500);
    res.send(err["message"]);
  }
};
const deletePayment = async ({ body: params }, res) => {
  try {
    const { _id } = params;
    try {
      await paymentDetailsCollection.deleteOne({ _id: new ObjectId(_id) });
      res.json({ status: "Success" });
    } catch (error) {
      console.error("Error form deletePayment ====> ", error);
    }
  } catch (err) {
    res.status(500);
    res.send(err["message"]);
  }
};
const storeInvoice = async ({ body: params }, res) => {
  try {
    let { file: fileArray, isReturn = false } = params,
      filePath = process["env"]["INVOICE_PATH"];

    const result = fileArray.map((imageData, index) => {
      const base64String = imageData["base64"],
        base64Data = base64String.replace(/^data:image\/\w+;base64,/, ""),
        buffer = Buffer.from(base64Data, "base64"),
        fileName = imageData["fileName"],
        fileFolder = fileName.split(".")[0].split("_");
      fileFolder.pop();

      filePath = filePath + fileFolder.join("_") + "/";
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      fs.writeFile(filePath + fileName, buffer, (err) => {
        if (err) {
          console.error("Error:", err);
        } else {
          // console.log("File saved successfully:", filePath);
        }
      });
      return fileName;
    });
    if (isReturn) {
      return result.map((fileName) => ({ fileName }));
    }
    res.json(result.map((fileName) => ({ fileName })));
  } catch (err) {
    console.log("storeInvoice ===> ", err["message"]);

    res.status(500);
    res.send(err["message"]);
  }
};
const generateAlphanumeric = (length = 10) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }

  return result;
};
const getInvoice = async ({ body: params }, res) => {
  let filePath = process["env"]["INVOICE_PATH"];
  const { fileName } = params,
    fileFolder = fileName.split(".")[0].split("_");
  fileFolder.pop();

  filePath = path
    .join(__dirname, "assets", "Invoice", fileFolder.join("_"), fileName)
    .replace("\\apiCollections", "");
  // console.log({ filePath });

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.sendFile(filePath);
};
const generateInvoiceSummary = async ({ body: params }, res) => {
  try {
    const { from = "2025-02-01", to = "2025-02-05" } = params || {};
    console.log(from, to);
    const result = await paymentDetailsCollection
      .find({
        date: {
          $gte: from,
          $lte: to,
        },
      })
      .toArray();
    if (result) {
      console.log("result", result);

      const images = result
        .flatMap((item) => {
          return item["invoiceFiles"].length > 0
            ? item["invoiceFiles"].map(({ fileName }) => {
                console.log(
                  __dirname,
                  "assets",
                  "Invoice",
                  item["date"].replaceAll("-", "_"),
                  fileName
                );

                const filePath = path
                  .join(
                    __dirname,
                    "assets",
                    "Invoice",
                    item["date"].replaceAll("-", "_"),
                    fileName
                  )
                  .replace("/apiCollections", "");

                return filePath;
              })
            : [];
        })
        .filter((_) => _);
      console.log(images);

      imagesToPdf(images, "output.pdf");
    }
  } catch (error) {
    console.log("error from generateInvoiceSummary ====> ", error);
  }
};
function imagesToPdf(imagePaths, outputPdfPath) {
  const doc = new PDFDocument({ size: "A4" }); // Standard A4 page size
  const stream = fs.createWriteStream(outputPdfPath);
  doc.pipe(stream);

  const imagesPerPage = 4;
  const imagesPerRow = 2;
  const margin = 20;
  const imageWidth = (doc.page.width - margin * 3) / imagesPerRow;
  const imageHeight = imageWidth * (16 / 9); // Adjust based on aspect ratio

  imagePaths.forEach((imagePath, index) => {
    if (index % imagesPerPage === 0) doc.addPage(); // Start a new page every 4 images

    const row = Math.floor((index % imagesPerPage) / imagesPerRow);
    const col = index % imagesPerRow;

    const x = margin + col * (imageWidth + margin);
    const y = margin + row * (imageHeight + margin);

    doc.image(imagePath, x, y, { width: imageWidth, height: imageHeight });
  });

  doc.end();
  stream.on("finish", () =>
    console.log(`PDF created successfully: ${outputPdfPath}`)
  );
}
module.exports = {
  addPayment,
  getPaymentDetails,
  storeInvoice,
  UpdatePayment,
  deletePayment,
  getInvoice,
  generateInvoiceSummary,
};
