var express = require("express");
var mongoskin = require("mongoskin");
var bodyParser = require("body-parser");

var app = express();

var db = mongoskin.db("mongodb://@localhost:27017/testdatabase", {safe:true});
var id = mongoskin.helper.toObjectID;

var allowMethods = function(req, res, next) {
	res.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
	next();
}

var allowCrossTokenHeader = function(req, res, next) {
    res.header('Access-Control-Allow-Headers', 'token');
    next();
}

var auth = function(req, res, next) {
  if (req.headers.token === "password123456") {
    return next();
  } else {
    return  next(new Error('No autorizado'));
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(allowMethods);
app.use(allowCrossTokenHeader);

app.param('coleccion', function(req, res, next, coleccion){
  req.collection = db.collection(coleccion);
  return next();
});

app.get('/api/:coleccion', auth, function(req, res, next) {
  req.collection.find({},{
    limit:10, sort: [['_id',-1]]
  }).toArray(function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});

app.post('/api/:colecion', auth, function(req, res, next) {
  req.collection.insert(req.body, {}, function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});

app.get('/api/:colecion/:id', auth, function(req, res, next) {
  req.collection.findOne({
    _id: id(req.params.id)
  }, function(e, result){
    if (e) return next(e);
 	   res.send(result);
  });
});

app.put('/api/:coleccion/:id', auth, function(req, res, next) {
	req.collection.update({
	     _id: id(req.params.id)
	}, {$set:req.body}, {safe:true, multi:false},
	    function(e, result){
	      if (e) return next(e);
		  res.send((result === 1) ? {msg:'success'} : {msg:'error'});
	});
});

app.delete('/api/:coleccion/:id', auth, function(req, res, next) {
  req.collection.remove({
      _id: id(req.params.id)
    },
    function(e, result){
      if (e) return next(e);
      res.send((result === 1) ? {msg:'success'} : {msg:'error'});
	});
});

app.listen(8080, function(){
  console.log ('Servidor escuchando en puerto 8080');
});
