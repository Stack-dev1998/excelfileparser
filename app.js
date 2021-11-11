const express = require("express");
const port = 5011;
var app = express();
var mysql = require("mysql");

var pool = mysql.createPool({
  host: "",
  user: "",
  password: "",
  database: "",
});

// pool.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }

//   console.log("connected as id " + pool.threadId);
// });

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.sendFile("views/index.html", { root: __dirname });
});
app.get("/get-structure/:tableName", (req, res) => {
  pool.query(
    `DESCRIBE ${req.params.tableName}`,
    async (err, result, fields) => {
      var data_headers = [];
      await result.map((item, i) => {
        data_headers.push(item.Field);
      });
      console.log("data_headers");
      console.log(data_headers);
      res.json(data_headers);
    }
  );
});
app.post("/upload", (req, res) => {
  var body = req.body;
  // console.log(body);
  var json = body.json;
  var sql_structure = body.sqlStructure;
  var tableName = body.tableName;
  var headers = Object.values(body.headers);
  var tableHeaders = Object.values(body.sqlTableHeaders);
  
  var filtered = json.map((el) => {
    var k = {};
    headers.forEach((header, i) => {
      k[header] = el[header];
    });
    return k;
  });

  var values = filtered.map((el) => Object.values(el));
  // console.log (values);
  let sql = `INSERT INTO ?? (??) VALUES ?`;
  console.log("values");
  console.log(values);
  var inserts = [tableName, tableHeaders, values];
  // console.log(inserts);
  sql = mysql.format(sql, inserts);
  console.log(sql);
  // console.log(sql);

  pool.query(sql, (error, results, fields) => {
    console.log(results);
    if (!error) {
      res.json("Uploaded");
    } else {
      res.json(error);
    }
  });
});

app.listen(port, () =>
  console.log("> Server is up and running on port : " + port)
);
