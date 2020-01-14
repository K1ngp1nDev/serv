const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jsonParser = express.json();
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://k1ngp1n:admin@cluster0-fpm48.mongodb.net/test?retryWrites=true&w=majority";
// mongoose.connect('"mongodb+srv://k1ngp1n:admin@cluster0-fpm48.mongodb.net/test?retryWrites=true&w=majority"');
// const userScheme = new Schema({name: String, password: String}, { versionKey: false });
// const User = mongoose.model("User", userScheme); //prototype

const userScheme = new Schema({name: String, password: String, friends: [{ name: String} ], versionKey: false });
const User = mongoose.model("User", userScheme); //prototype
// const userMess = new Schema({ index: String }, { versionKey: false });


const userMessArray = new Schema({ mess: [{ index: String }],  versionKey: false });
const UserMess = mongoose.model("UserMess", userMessArray); //prototype

const bcrypt = require("bcrypt-nodejs");
// const router = express.Router();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const Cors = require("cors");
const cookieParser = require('cookie-parser');
const passport = require('passport');
// router.use(cookieParser());
// var corsOptions = {
//   origin: 'http://localhost:8080',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
app.use(Cors());
// app.options('/sign-login', Cors()) // enable pre-flight request for DELETE request
// app.del('/products/:id', cors(), function (req, res, next) {
//   res.json({msg: 'This is CORS-enabled for all origins!'})
// })


const store = new MongoDBStore({
  uri: 'mongodb+srv://k1ngp1n:admin@cluster0-fpm48.mongodb.net/test?retryWrites=true&w=majority',
  databaseName: "Project0",
  collection: 'sessions'
});

app.use(session({
  secret: 'awdsasadasda',
  cookie: {
    path: '/',
    maxAge: 300000, // 5 min,
  },
  store: store,
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

store.on('error', function(error) {
  console.log(error);
});
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});


app.get('/',function(req, res) {
  // var ccookie = req.cookies;
  // console.log('bfore cookie');
  // console.log(JSON.stringify(req.cookies), 'cookie');
    res.send(`<h1>Hello
    ${JSON.stringify(req.session)}</h1>`);
});


app.get('/getcookies', function(req, res) {
  console.log(JSON.stringify(req.cookies), 'cookie /getcookies');
    res.send('Hello ' + JSON.stringify(req.session));
});


app.get('/sign-login/showAll', function(req, res) { //cloud 
  MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function(err, client) {
    const db = client.db("Project0");
      const collection = db.collection("users");
      if(err) return console.log(err);
      
      collection.find({}).toArray(function(err, results) {
        if (err) throw err;
        const array = [];
            for( let i = 0; i < results.length; i++) {
              if ( results[i].name != null && results[i].name != '') {
                array.push(results[i].name);
              }
            }
          // console.log(JSON.stringify(array), 'array');
        res.send(array);
      });
    client.close();
  });
});

app.get('/sign-login/showAllTest', function(req, res) { //cloud 
   MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function(err, client) {
      const db = client.db("Project0");
      const collection = db.collection("users");
      if(err) return console.log(err);
      
      collection.find({}).toArray(function(err, results) {
        if (err) throw err;
        const array = [];
        array.push('testName');

            for( let i = 0; i < results.length; i++) {
              if ( results[i].name != null && results[i].name != '') {
                array.push(results[i].name);
              }
            }
          // console.log(JSON.stringify(array), 'array');
        res.send(array);
      });
    client.close();
  });
});

app.get('/users', function(req, res) {
   MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function(err, client) {
      const db = client.db("Project0");
      const collection = db.collection("users");
      if(err) return console.log(err);
      
      collection.find({}).toArray(function(err, results) {
        if (err) throw err;
        const array = [];
        // array.push('testName');

            for( let i = 0; i < results.length; i++) {
              if ( results[i].name != null && results[i].name != '') {
                array.push(results[i].name);
              }
            }
          // console.log(JSON.stringify(array), 'array');
        res.send(array);
      });
    client.close();
    });
});

// function loadUser(req, res, next) {
//   if (req.session.id) {
    
//     // console.log(req.session.id,'loadUser tst 0');
//     // User.findById(req.session.id, function(user) {
//       User.findOne({_id: req.session.id}, function(err, user) {
//         if (user) {
//         console.log(user, 'loadUser tst 1');
//         // console.log(req.session.id, 'req.session.id loadUser tst 1');
//         req.currentUser = user;
//         next();
//       } else {
//         console.log(user,'loadUser tst 2');
//         // res.redirect('/');
//         next();
//       }
//     })
      
//     // });
//   } else {
//     console.log(user,'loadUser tst 3');
//     res.redirect('/');
//   }
// }

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(200).send({msg: 'Выход'});
    });
});



app.post("/quickregistration", jsonParser, function (req, res) { //cloud 
    const userName = req.body.userName;
    // const age = req.body.age;
    const passWord = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if(!userName || !passWord ) {
      console.log('Все поля должны быть заполнены');
      return res.status(200).send({msg: 'Все поля должны быть заполнены', ok: false});
    } else if ( userName.length < 3 || userName.length > 16 ) {
      console.log('Длина логина от 3 до 16 символов');
      return res.status(200).send({msg: 'Длина логина от 3 до 16 символов', ok: false});
    } else if ( passWord.length < 5 || userName.length > 16 ) {
      console.log('Длина пароля от 5 до 16 символов');
      return res.status(200).send({msg: 'Длина пароля от 5 до 16 символов', ok: false});
    } else if ( passWord !== confirmPassword ) {
      console.log('Пароли не совпадают');
      return res.status(200).send({msg: 'Пароли не совпадают', ok: false});
    }
    const salt = bcrypt.genSaltSync(8);
    const cryptpassword = bcrypt.hashSync(passWord, salt);

    MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function(err, client) {
        const db = client.db("Project0");
        const collection = db.collection("users");
        // const userScheme = new Schema({name: String, password: String, friends: [{ name: String} ], versionKey: false });
        const user = new User({name: userName, password: cryptpassword, friends: [{ name: ''} ]});

        if (err) throw err;

          collection.find({}).toArray(function(err, results) {
          if (err) throw err;
          let nick = '';

            for( let i = 0; i < results.length; i++) {
              if ( results[i].name == userName ) {
                nick = results[i].name;
                // console.log('Такой никнейм уже есть, придумайте другой!');
                res.status(200).send({msg: 'Такой никнейм уже есть, придумайте другой!', ok: false});
                client.close();
                break;
              }
            }

            if ( nick == '') {
              collection.insertOne(user, function(err, res) {
                // console.log('Пользователь успешно добавлен!');
                if (err) throw err;
                client.close();
              }); 
              // res.status(200).send({msg: 'Пользователь не найден!', ok: false});
              res.status(200).send({msg: 'Пользователь успешно добавлен!', ok: true});
            }
          });
    });
});

app.post("/sign-login", function (req, res) { //cloud 
    const userName = req.body.userName;
    const password = req.body.password;
    
    // res.send();
    // console.log(JSON.stringify(req.signedCookies), 'cookie');
    
    if(!userName || !password ) {
      console.log('Все поля должны быть заполнены');
      return res.status(200).send({msg: 'Все поля должны быть заполнены', ok: false});
    } else if ( userName.length < 3 || userName.length > 16 ) {
      console.log('Длина логина от 3 до 16 символов');
      return res.status(200).send({msg: 'Длина логина от 3 до 16 символов', ok: false});
    }
    MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function(err, client) {
        const db = client.db("Project0");
        const collection_users = db.collection("users");
        
        if (err) throw err;
        
          collection_users.findOne({
            name: userName
          })
          .then(user => {
            if (!user) {
                client.close();
                // console.log('Пользователь не найден!');
                res.status(200).send({msg: 'Пользователь не найден!', ok: false});
            } else {
              req.session._id = user._id;
              req.session.name = user.name;
              // const tstcookie = 
              // console.log(req.cookies.cookieName, 'cookie');
              // console.log(req.session._id, 'session._id');
              // console.log(req.session.id, 'session.id');
              // var cookie = req.cookies;
              // console.log(cookie, 'cookie');
              client.close();
              
              // console.log(`Соединение установлено! Привет ${JSON.stringify(user.name)} + ${JSON.stringify(req.session)}`);
              res.send({msg: `Соединение установлено! Привет ${JSON.stringify(user.name)}`, ok: true, login: user.name});
              // res.send(`${JSON.stringify(req.session)}`);
            }
          })
          .catch( error => {
            res.status(500).send({msg: `Что-то пошло не так, попробуй позже.`, ok: false});
          });
      });
});

//asyncTestWriteNewMessage
app.post('/users/:userName/messages', function(req, res) {
  const userName = req.params.userName;
  const mess = req.body.mess;

  MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function(err, client) {
        const db = client.db("Project0");
        const collection_users = db.collection("messages");
        
        collection.insertOne(mess, function(err, res) {
          console.log('Сообщение успешно добавлено!');
          if (err) throw err;
          client.close();
        }); 
      });

  // readFile(`./server/data/users/${userName}/`, 'messages.json')
  //   .then(data => {
  //     let arr = JSON.parse(data)
  //     arr.push(req.body.smsVal)
  //     writeFile(`./server/data/users/${userName}/`, 'messages.json', JSON.stringify(arr))
  //     .then(data => res.send(arr))
  //     .catch( error => {
  //       res.status(500);
  //       res.send(error);
  //     });
  //     return arr;
  //   })
  //   .catch( error => {
  //     res.status(500);
  //     res.send(error);
  //   });
});
//asyncShowMsgFrom
app.get('/users/:userName/messages', function(req, res) {
  const userName = req.params.userName;
  // const mess = req.body.mess;
  console.log(userName, 'get mess');
  res.status(200).send({ok: "ok"});
  // MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function(err, client) {
  //       const db = client.db("Project0");
  //       const collection_users = db.collection("messages");
        
  //       collection.insertOne(mess, function(err, res) {
  //         console.log('Сообщение успешно добавлено!');
  //         if (err) throw err;
  //         client.close();
  //       }); 
  //     });

  // readFile(`./server/data/users/${userName}/`, 'messages.json')
  //   .then(data => {
  //     let arr = JSON.parse(data)
  //     arr.push(req.body.smsVal)
  //     writeFile(`./server/data/users/${userName}/`, 'messages.json', JSON.stringify(arr))
  //     .then(data => res.send(arr))
  //     .catch( error => {
  //       res.status(500);
  //       res.send(error);
  //     });
  //     return arr;
  //   })
  //   .catch( error => {
  //     res.status(500);
  //     res.send(error);
  //   });
});

// app.post("/sign-login", jsonParser, function (req, res) { //cloud 
//     // req.session.message = 'Hello World';
//     if(!req.body || req.body.userName == '') {
//       console.log('empty field login');
//       return res.sendStatus(400);
//     }
//     MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
//         const db = client.db("Project0");
//         const collection = db.collection("users");
//         const userName = req.body.userName;
//         let tmp = '';
        
//         collection.find({}).toArray(function(err, results) {
//         if (err) throw err;

//         for( let i = 0; i < results.length; i++) {
//           if ( results[i].name == userName ) {
//             tmp = results[i].name;
//             console.log(userName, 'yes');


//             client.close();
//             // res.send(JSON.stringify(userName));
//             break;
//             // return res.redirect('http://localhost:8080/main/dashboard');
//           }
//         }
//         if ( tmp == '') {
//           console.log(userName, 'no');
//           client.close();
//           res.send(false);
//         }
//       });
//       client.close();
//     });
//     console.log(req.session, 'test userName');
//     // client.close();
// });


/************************************************************************/
function readFile(path, file) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${path}${file}`, 'utf-8', function (error, data) {
       (error) ? reject(error) : resolve(data);
    });
  })
}

function writeFile(path, file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${path}${file}`, data, 'utf-8', function (error, data) {
       (error) ? reject(error) : resolve(data);
    });
  })
}


// app.get('/users', function(req, res) {
//   readFile('./server/data/', 'users.json')
//     .then(data => res.send(data))
//     .catch( error => {
//       res.status(500);
//       res.send(error);
//     });
// });

// app.get('/users/:userId/:info', function(req, res) {
//   let userId = req.params.userId;
//   let info = req.params.info;
//     readFile(`./server/data/users/${userId}/`, `${info}.json`)
//       .then(data => res.send(data))
//       .catch( error => {
//         res.status(500);
//         res.send(error);
//     });
// });


// app.post('/users/:userId/messages', function(req, res) {
//   const userId = req.params.userId;

//   readFile(`./server/data/users/${userId}/`, 'messages.json')
//     .then(data => {
//       let arr = JSON.parse(data)
//       arr.push(req.body.smsVal)
//       writeFile(`./server/data/users/${userId}/`, 'messages.json', JSON.stringify(arr))
//       .then(data => res.send(arr))
//       .catch( error => {
//         res.status(500);
//         res.send(error);
//       });
//       return arr;
//     })
//     .catch( error => {
//       res.status(500);
//       res.send(error);
//     });
// });


// app.get('/sign-login/showAll', function(req, res) {
  
//   const username = req.body.userName;

//   const MongoClient = require("mongodb").MongoClient;
   
//   const url = "mongodb://localhost:27017/";
//   const mongoClient = new MongoClient(url, { useNewUrlParser: true });
  
//   mongoClient.connect(function(err, client){
      
//     const db = client.db("usersdb");
//     const collection = db.collection("users");
//     // let user = {name: username};
//     // collection.insert(user, function(err, result){
          
//         if(err) return console.log(err);
//         const array = [];
//         collection.find().toArray(function(err, results){
//           for( let i = 0; i < results.length; i++) {
//             if ( results[i].name != null && results[i].name != '') {
//               array.push(results[i].name);
//             }
//           }
//           console.log(JSON.stringify(array), 'array');
//           client.close();
//         res.send(array);
//     });
//   })
// });

// app.post('/sign-login', function(req, res) {
//   const username = req.body.userName;

//   const MongoClient = require("mongodb").MongoClient;
   
//   const url = "mongodb://localhost:27017/";
//   const mongoClient = new MongoClient(url, { useNewUrlParser: true });
  
//   mongoClient.connect(function(err, client){
      
//     const db = client.db("usersdb");
//     const collection = db.collection("users");
//     let user = {name: username};
//     collection.insert(user, function(err, result){
          
//         if(err) return console.log(err);

//         console.log(result);
//         client.close();
//     });
// })
  // .toLowerCase();
  // console.log(req.body.userName, 'test login server');
  // console.log(username, 'test login server');

  // readFile('./server/data/', 'users.json')
  //   .then(data => {
  //     // let tmp = JSON.parse(data);
  //     // console.log(tmp);
      
  //     // for( let i = 0; i < tmp.length; i++) {
  //     //   console.log(tmp[i].name);
  //     // }
  //     return data;
  //   })
  //   .then(data => res.send(username))
  //   .catch( error => {
  //     res.status(500);
  //     res.send(error);
  //   })
    // let arr = JSON.parse(data)
    // arr.push(req.body.smsVal)
    // writeFile(`./server/data/users/${userId}/`, 'messages.json', JSON.stringify(arr))
    // .then(data => res.send(arr))
    // .catch( error => {
    //   res.status(500);
    //   res.send(error);
    // });
    // return arr;
    // res.redirect('/sign-login');
  // res.send(`<h1>${username}</h1>`);
// });


app.listen(PORT, function(){
    console.log(`Example app listening on PORT ${PORT}`);
});
// app.use(app);