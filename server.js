const express = require('express');
const bodyParser= require('body-parser')
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true})) 
var db;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://admin:86218621@cluster0.s0k87.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', (err, client) =>{

    if(err) {return console.log(err)};
    db = client.db('TodoList');

    app.listen(8080, function(){
        console.log('listening on 8080');
    });

})

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', function(req, res){
    res.sendFile(__dirname + '/write.html');
});

app.post('/add', function(req, res){
    res.send('전송완료');
    db.collection('post').insertOne({제목 : req.body.title, 날짜 : req.body.date}, (err, fin) =>{
        console.log('저장완료');
    });
  });

  app.get('/list', function(req, res){
    res.render('list.ejs');
});
