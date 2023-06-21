const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const {
  MongoClient,
  ServerApiVersion,
  GridFSBucket,
  ObjectId,
} = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
app.use(cors());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
const port = process.env.port || 5000;

/* 
========== It's for image uploade in specific folder in discstorage ========
Set up the Multer middleware
const storage = multer.diskStorage({
destination: function (req, file, cb) {
Specify the destination folder where the uploaded file will be stored
  cb(null, "uploads/");
},
filename: function (req, file, cb) {
Generate a unique filename for the uploaded file
    cb(null, Date.now() + "-" + file.originalname);
  },
});
Define a route to handle file uploads
app.post("/upload", upload.single("image"), (req, res) => {
The uploaded file can be accessed using req.file
if (!req.file) {
  return res.status(400).send("No file uploaded.");
}

console.log(req.file);
Process the uploaded file as per your requirements
In this example, we're just sending back the file information
  res.send({
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

MongoDB Conection

Set up the Multer middleware

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); 

*/

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PWORD}@mrn.gtqnz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Create a Images Collection Database .
    const imagesCollection = client.db("ImageDB").collection("Images");

    // ! Add a image:**
    app.post("/uploade_image", async (req, res) => {
      const item = req.body;
      const result = await imagesCollection.insertOne(item);
      res.send({ success: true, data: result });
    });

    // ! get All Images**  
    app.get('/uploade_image', async (req, res) => {
      const result = await imagesCollection.find().toArray();
      res.send(result);
  })
  

    app.get("/", (req, res) => {
      res.send("Hello Nayem");
    });
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/* 
   ================= * It's not working, TODO : I want to image form Mongodb batabase 
   app.get("/image", (req, res) => {
      const db = client.db("ImageDB");
      const collection = db.collection("Images");
      const bucket = new GridFSBucket(db);

      collection.find().toArray((err, documents) => {
        if (err) {
          console.error("Error retrieving images from MongoDB:", err);
          return res.status(500).send("Error retrieving images from MongoDB.");
        }

        const images = [];

        documents.forEach((document) => {
          const fileId = document._id;

          const downloadStream = bucket.openDownloadStream(fileId);
          let imageData = "";

          downloadStream.on("data", (chunk) => {
            imageData += chunk.toString("base64");
          });

          downloadStream.on("end", () => {
            const image = {
              _id: document._id.toString(),
              filename: document.metadata.filename,
              contentType: document.metadata.contentType,
              size: document.metadata.size,
              data: imageData,
            };

            images.push(image);

            if (images.length === documents.length) {
              res.send(images);
            }
          });

          downloadStream.on("error", (err) => {
            console.error("Error downloading image from MongoDB:", err);
            res.status(500).send("Error downloading image from MongoDB.");
          });
        });
      });
    });
 */

/*    
+++++++ It's working, It's for post image by chose image button and directly image save in MongoDB DataBase   ++++++++++++++++++++

app.post("/upload", upload.single("image"), (req, res) => {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const db = client.db("ImageDB");
      const collection = db.collection("Images");
      const bucket = new GridFSBucket(db);

      const uploadStream = bucket.openUploadStream(req.file.originalname);
      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", () => {
        const fileId = uploadStream.id;
        const fileMetadata = {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
          size: req.file.size,
          uploadDate: new Date(),
        };

        collection.insertOne({ _id: fileId, metadata: fileMetadata }, (err) => {
          if (err) {
            console.error("Error storing file in MongoDB:", err);
            return res.status(500).send("Error storing file in MongoDB.");
          }

          res.send({
            fileId: fileId.toString(),
            filename: fileMetadata.filename,
            size: fileMetadata.size,
          });
        });
      });
    });
 */
