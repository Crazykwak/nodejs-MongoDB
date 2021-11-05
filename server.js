const express = require('express');  // 익스프레스
const bodyParser= require('body-parser')  //데이터를 body로 때겠다.
const app = express();  
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true})) 

const methodOverride = require('method-override');
app.use(methodOverride('_method')); //오버라이드 사용

var db;

app.use('/public', express.static('public'));
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://admin:86218621@cluster0.s0k87.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', (err, client) =>{

    if(err) {return console.log(err)};
    db = client.db('TodoList');

    app.listen(8080, function(){
        console.log('listening on 8080');
    });

})

app.get('/', function(req, res){
    res.render('index.ejs');
});

app.get('/write', function(req, res){
    res.render('write.ejs');
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

app.get('/detail/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
        res.render('detail.ejs', { data : result});
    })
})

app.get('/edit/:id', function(req,res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
        res.render('edit.ejs', {data : result});
    })

})

app.put('/edit', function(req, res){
    db.collection('post').updateOne({_id: parseInt(req.body.id) },{ $set : { 제목 : req.body.title, 날짜 : req.body.date}}, function(err, result){
        if(err) return console.log(err);
        res.redirect('/list');
    })
});



const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : 'secret code', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/login', function(req,res){
    res.render('login.ejs');
})


app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}),function(req, res){
    res.redirect('/');
})

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function(inputID, inputPW, done){
    console.log(inputID, inputPW);
    db.collection('login').findOne({id: inputID}, (err, result) =>{
        if(err) return done(err);
        if(!result) return done(null, false, {message : '존재하지 않는 아이디입니다.'});
        if(inputPW == result.pw){
            return done(null, result);
        } else {
            return done(null, false, {message : '비밀번호가 맞지 않습니다.'});
        }
    })
}));

passport.serializeUser(function(user, done){
    done(null, user.id)
});
passport.deserializeUser(function(ID, done){
    db.collection('login').findOne({id : ID}, function(err, result){
        done(null, result);
    })
});

app.get('/fail', function(req, res){
    res.render('fail.ejs');
});

app.get('/mypage', isLogin ,function(req, res){
    console.log(req.user);
    res.render('mypage.ejs', {player: req.user});    
});

function isLogin(req, res, next){
    if(req.user){
        next()
    } else {
        res.send('로그인이 필요합니다.')
    }
};


app.get('/signup', function(req, res){
    res.render('fail.ejs');
})
