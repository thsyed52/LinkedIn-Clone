
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport')
var session = require('express-session')
var bodyParser = require('body-parser')
var connection = require('./connection/sql');
var MySQLStore = require('express-mysql-session')(session);
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var companyRouter = require('./routes/company');
var flash = require('connect-flash');
var cors = require('cors');
var app = express();
var multer = require('multer');
var fs = require('fs');
var path = require('path')
var config = JSON.parse(fs.readFileSync("./components/config.json"));
var nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  port: 25,
  auth: {
    user: 'jagopk2@gmail.com',
    pass: config.password
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.use(bodyParser.urlencoded({ extended: false })); //For body parser
app.use(bodyParser.json());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mysecret',
  store: new MySQLStore({
    expiration: 1000 * 10 * 10
  }, connection),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 10 * 10 }
}));
var storage = multer.diskStorage({
  fileFilter: function (req, file, callback) {
      var ext = path.extname(file.originalname);
      console.log(file.originalname);
      console.log(path.extname(file.originalname))
      if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
          return callback(new Error('Only images are allowed'))
      }
      callback(null, true)
  },destination: (req, file, cb) => {
    cb(null, 'public/images/uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
var upload = multer({ storage })
app.use(cors());
app.use(flash());
require('./config/passport')
app.use(passport.initialize());
app.use(passport.session());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/company', companyRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

indexRouter.get('/download/:name', function(req, res){
  var name = req.params.name;
  console.log(__dirname);
  // var file = __dirname + '/public/images/uploads/1556808251266-FB_IMG_1555820218818.jpg';
  var file = __dirname + `/public/images/uploads/${name}`;
  // console.log(file);
  // res.send(file);
  res.download(file); // Set disposition and send it.
});

indexRouter.post('/upload', upload.single('image'), (req, res) => {
  // console.log('i am call')
  if (req.file)
    res.json({
      imageUrl: `${req.file.filename}`
    });
  else
    res.status("409").json("No Files to Upload.");
});

indexRouter.post('/sendmail', (req, res, next) => {
  console.log('i am called')
  var to = req.body.to;
  var id = req.body.id;
 
  if (id === 1) {
    let HelperOptions = {
      from: `"Junaid Ahmed" <jagop2@gmail.com`,
      to,
      subject: 'Succesfully Signed up',
      text: 'Welcome to our New Job Portal .'
    };
    transporter.sendMail(HelperOptions, (error, info) => {
      if (error) {
        return console.log(error)
      }
      console.log("This message is sent")
      console.log(info)
    })
  } else if (id === 2) {
    let HelperOptions = {
      from: `"Junaid Ahmed" <jagop2@gmail.com`,
      to,
      subject: 'Password Changed',
      text: 'Your password has been changed'
    };
    transporter.sendMail(HelperOptions, (error, info) => {
      if (error) {
        return console.log(error)
      }
      console.log("This message is sent")
      console.log(info)
    })
  }else if (id === 3) {
    let HelperOptions = {
      from: `"Junaid Ahmed" <jagop2@gmail.com`,
      to,
      subject: 'Forgot Password?',
      text: 'Here is your password -----'
    };
    transporter.sendMail(HelperOptions, (error, info) => {
      if (error) {
        return console.log(error)
      }
      console.log("This message is sent")
      console.log(info)
    })
  }else if (id === 4) {
    let HelperOptions = {
      from: `"Junaid Ahmed" <jagop2@gmail.com`,
      to,
      subject: 'Congratulations you have been hired',
      text: 'Kindly check the profile for the applied jobs '
    };
    transporter.sendMail(HelperOptions, (error, info) => {
      if (error) {
        return console.log(error)
      }
      console.log("This message is sent")
      console.log(info)
    })
  }else{
    let HelperOptions = {
      from: `"Junaid Ahmed" <jagop2@gmail.com`,
      to,
      subject: 'Check Nodemailer',
      text: 'this is body'
    };
  }
  

});



// var name = "foobar";
// exports.name  = name;

module.exports = app;
