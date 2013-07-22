/* jshint  node: true, undef: true, unused: true, laxcomma: true */
var express = require('express'),
  nano = require('nano')('http://localhost:5984'),
  app = express(),
  db_name = "fiverr1",
  db = nano.use(db_name);

//Express base configuration
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));


//Working search !!!!!
//http://localhost:5984/fiverr1/_fti/_design/sample/by_text?q=aa~
app.get("/create_db", function(request, response) {
  nano.db.create(db_name, function(error, body) {
    if(error) {
      return response.send(error.message, error['status-code']);
    }
    response.send("Db [" + db_name + "] was created.", 200);
  });
});


app.get("/design_doc", function(request, response) {
  var a = {
    "fulltext": {
      "by_text": {
        "index": "function(doc) { var ret=new Document(); ret.add(doc.text); return ret }"
      }
    }
  };
  var doc_name = "_design/sample";
  db.insert(a, doc_name, function(error, body) {
    if(error) {
      return response.send(error.message, error['status-code']);
    }
    response.send(body, 200);
  });
});

var TOTAL_DOCS = 10000;
app.get("/populate", function(request, response) {
  for(var i = 0; i < TOTAL_DOCS; i++) {
    var doc_name = "_design/sample";
    doc_name = "doc_" + i;
    populateSingle(doc_name, i, response);
  }
});

function populateSingle(name, i, response) {
  db.insert(populate_random_stuff(), name, function(error, body) {
    if(error) {
      return response.send(error.message, error['status-code']);
    }
    response.send(body, 200);
  });
}

app.get("/", function(request, response) {
  response.render("index.html");
});


function randomWord() {
  return Math.random().toString(24).substring(7).replace(/\d/g, "");
}

function populate_random_stuff() {
  var word1 = randomWord();
  var word2 = randomWord();
  var word3 = randomWord();
  return {
    text: [word1, word2, word3].join(" ")
  };
}

app.listen(3333);
console.log("server is running. check expressjs.org for more cool tricks");