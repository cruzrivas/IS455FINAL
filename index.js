const express = require("express");
const app = express();
const pg = require('pg');
const multer = require("multer");
const { Pool } = require("pg");
const upload = multer();
const dblib = require("./dblib.js");

const pool = new Pool({
    connectionString: process.env.CRUNCHY_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(express.static("public"));
app.use(express.static("CSS"));
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/input", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    res.render("input", {
        type: "get",
        totRecs: totRecs.totRecords,

    });
  });
  
  app.post("/input",  upload.single('filename'), (req, res) => {
     if(!req.file || Object.keys(req.file).length === 0) {
         message = "Error: Import file not uploaded";
         return res.send(message);
     };
     const buffer = req.file.buffer; 
     const lines = buffer.toString().split(/\r?\n/);
     let numRecordsInserted = 0;
     let numRecordsNotInserted = 0;
     let errors = []; 
     lines.forEach(line => {
          product = line.split(",");
      const sql = 'INSERT INTO book (book_id, title, total_pages, rating, isbn, published_date) VALUES ($1, $2, $3, $4, $5, $6)';
          pool.query(sql, product, (err, result) => {
              if (err) {
                  numRecordsNotInserted++;
                  console.log(`Error message: ${err.message}`);
              } else {
                  numRecordsInserted++;
              }
         });
     });
     console.log(numRecordsInserted)
     console.log(numRecordsNotInserted)
     let message = "Import Summary:\n";
     message += `Records Processed: ${lines.length}\n`;
     message += `Records Inserted Successfully: ${numRecordsInserted}\n`;
     message += `Error Summary: \n`;
     message += `Records Not Inserted: ${numRecordsNotInserted}\n`;
     
     errors.forEach(error => {
         message += `${error}\n`;
     });
     res.send(message);
  });

app.get('/sumofseries', (req, res) => {
  res.render('sumofseries');
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});
