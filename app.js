const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const { engine } = require('express-handlebars');
const passport = require('passport');

const app = express();
const port = 3000;

const ideas = require('./routes/ideas');
const users = require('./routes/users');
require('./config/passport')(passport);

app.use(express.json());
app.use(express.urlencoded({ extends: true }));

// connect to mongoose
mongoose
  .connect('mongodb://localhost:27017/vidjot')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(methodOverride('_method'));
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
// passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// set global variable
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.get('/', (req, res) => {
  const title = 'I am home page title';

  res.render('home', {
    title: title,
  });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.use('/ideas', ideas);
app.use('/users', users);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
