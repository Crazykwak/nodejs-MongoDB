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
    db.collection('counter').findOne({name : '게시물개수'}, (err, result) => {
        const total = result.totalPost

        db.collection('post').insertOne({_id : total + 1, 제목 : req.body.title, 날짜 : req.body.date}, (err, fin) =>{
            console.log('저장완료');
            db.collection('counter').updateOne({name : '게시물개수'},{ $inc : {totalPost : 1}}, (err, result) => {
                if(err) return console.log(err);
            })
        });

        

    });

  });

  app.get('/list', function(req, res){
    db.collection('post').find().toArray((err, fin) => {
        res.render('list.ejs', {posts : fin});
    });
});

app.delete('/delete', (req, res) => {
    req.body._id = req.body._id * 1;
    db.collection('post').deleteOne(req.body, (err, result) => {
    })
    res.status(200).send({ message : '성공했습니다.'});

})