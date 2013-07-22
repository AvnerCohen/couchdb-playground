/* jshint  node: true, undef: true, unused: true, laxcomma: true */
var nano = require('nano')('http://localhost:5984');
var db_name = "my_db";
var db = nano.use(db_name);
var express = require('express');
var app = module.exports = express();

//Express base configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);
  app.use('/public', express.static('public'));
});


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
      },
      "by_message": {
        "index": "function(doc) { if(typeof(doc.messages) == 'undefined') return null; var ret=new Document(); ret.add(doc.messages.join(' '), {'field':'message', 'store': 'yes'}); return ret }"
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

var TOTAL_USERS = 10000;
var TOTAL_CONVERSATIONS = 10000;

var populated_conversations = [];
app.get("/populate", function(request, response) {
  for(var i = 0; i < TOTAL_USERS; i++) {
    var doc_name = "user_id" + i;
    populateSingleUser(doc_name, i, response);
  }

  for(var i = 0; i < TOTAL_CONVERSATIONS; i++) {
    var doc_name = "conversation" + i;
    populateSingleConversation(doc_name, i, response);
  }

  for(var i = 0; i < populated_conversations.length; i++) {
    var conv_name = populated_conversations[i]
    populatedSomeMessages(conv_name, i, response);
  }

});

var MAX_MESSAGES = 20;

function populatedSomeMessages(conv_name, i, response) {

  var messages_len = Math.round(Math.random() * MAX_MESSAGES);
  db.get(conv_name, {}, function(err, body) {
    var messages = [];
    for(var i = 0; i < messages_len; i++) {
      messages.push([randomWord(), randomWord(), randomWord(), randomWord()].join(" "));
    }
    body["messages"] = messages;

    db.insert(body, conv_name, function(error, body) {
      if(error) {
        return response.send(error.message, error['status-code']);
      }
      response.send(body, 200);
    });

  });

}

function populateSingleConversation(docname, i, response) {
  var user_id_1 = Math.round(Math.random() * TOTAL_USERS);
  var user_id_2 = Math.round(Math.random() * TOTAL_USERS);
  var conv_key = [user_id_1, user_id_2].sort().join("_");
  docname = docname + conv_key;

  populated_conversations.push(docname); // preserave for future use
  db.insert({
    start_data: new Date().getTime(),
    messages: []
  }, docname, function(error, body) {
    if(error) {
      return response.send(error.message, error['status-code']);
    }
    response.send(body, 200);
  });
}


function populateSingleUser(docname, i, response) {
  var username = [randomWord(), randomWord()].join(" ");
  db.insert({
    username: username,
    id: i
  }, docname, function(error, body) {
    if(error) {
      return response.send(error.message, error['status-code']);
    }
    response.send(body, 200);
  });
}



var TOTAL_DOCS = 10000;
app.get("/populate_old", function(request, response) {
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