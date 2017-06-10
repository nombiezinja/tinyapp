const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const userService = require('./services/user_service');

const users = userService.users;
const urlDatabase = userService.urlDatabase;
const rando = userService.randomString;
const findLink = userService.findLink;
const findUserLogin = userService.findUserLogin;
const findUser = userService.findUser;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  secret: 'I listen to John Newman unironically.'
}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
//logged in -> /urls; not logged in -> /login
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {

  const userUniqueUrl = findLink(req.session.userID);
  const templateVars = { urls: userUniqueUrl,
    username: req.session.userID,
    userEmail: req.session.userEmail
  };

//diff page rendered if logged in
  if(!req.session.userID) {
    res.render('urls_index', templateVars);
  } else {
    res.render('urls_index_loggedin', { urls: userUniqueUrl,
      username: req.session.userID,
      userEmail: req.session.userEmail
    });
  }
});

//call urls_new.ejs to display for /urls/new page
app.get('/urls/new', (req, res) => {
  let templateVars = { username: req.session.userID,
    users: users,
    userEmail: req.session.userEmail};
  res.render('urls_new', templateVars);
});



app.get('/register', (req, res) => {
  if(req.session.userID) {
    res.redirect('/urls');
  } else {
    res.render('registration', {username: req.session.userID,
      userEmail: req.session.userEmail});
  }
});


app.post('/register', (req, res) => {
//if no data submitted
  if(!req.body.email || !req.body.password) {
    res.status(403).send('Oops, you must enter an email and a password!');
  }
//if email already exists
  if (findUser(req.body.email)) {
    res.status(403).send('Oops, looks like that email was already taken!');
  }
//lightening protection against extremely unlikely chance of duplicate user ID
  let userId;
  do {
    userID = rando(8);
  } while(users[userID]);
  users[userID] = { id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10) };
//set cookie
  req.session.userID = userID;
  req.session.userEmail = req.body.email;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  if(!req.session.userID) {
    res.render('login', {users: users,
      username: req.session.userID,
      userEmail: req.session.userEmail} );
  } else {
    res.render('loggedin', {users: users,
      username: req.session.userID,
      userEmail: req.session.userEmail});
  }
});

app.post('/login', (req, res) => {
  const userEmail = req.body.email;
//match password to authenticate
  if(!findUserLogin(userEmail)) {
    res.status(403).send('Oops, looks like this email hasn\'t been registered yet.');
  } else {
    let user = findUserLogin(userEmail);
    if (bcrypt.compareSync(req.body.password, user.password)) {
//set cookie
      req.session.userID = user.id;
      req.session.userEmail = userEmail;
      res.redirect('/login');
    } else {
      res.status(403).send('Oops, looks like you have entered the wrong information. Yoink!');
    }
  }
});

app.post('/urls', (req, res) => {
//protection against duplicate shortURL
  do {
    shortURL = rando(6);
  } while(urlDatabase[shortURL]);

  urlDatabase[shortURL] = { link: req.body.longURL,
    userID: req.session.userID};
  res.redirect('/urls/' + shortURL);

});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userUniqueUrl = findLink(req.session.userID);

  let templateVars = { userUrls: userUniqueUrl,
    urls: urlDatabase,
    shortURL: req.params.id,
    username: req.session.userID,
    users: users,
    userEmail: req.session.userEmail
  };
//can't delete when not logged in or when user did not create this link
  if(!userUniqueUrl[req.params.shortURL]) {
    res.render('no_access', {username: req.session.userID,
      userEmail: req.session.userEmail});
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});

//ensures shortURL cannot be deleted by typing in this link
app.get('/urls/:shortURL/delete', (req, res) => {

  const userUniqueUrl = findLink(req.session.userID);

  if(!userUniqueUrl[req.params.shortURL]) {
    res.render('no_access', {username: req.session.userID,
      userEmail: req.session.userEmail});
  }else {
    res.redirect('/urls');
  }
});

app.get('/urls/:id', (req, res) => {

  const userUniqueUrl = findLink(req.session.userID);

  let templateVars = { userUrls: userUniqueUrl,
    allUrls: urlDatabase,
    shortURL: req.params.id,
    username: req.session.userID,
    users: users,
    userEmail: req.session.userEmail
  };
  if(!urlDatabase[req.params.id]) {
    res.status(404).send('Uh-oh, looks like that TinyURL does not exist. Check again!');
  } else {
    if(!req.session.userID) {
      res.render('urls_show', templateVars);
    } else {
      res.render('urls_show_loggedin', templateVars);
    }
  }
});


app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL].link = req.body.newURL;
  res.redirect(shortURL);
});

///u/:id redirects to longURL
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].link;
  res.redirect(longURL);
});

//clear cookie when log out form submitted, redirect to /urls
app.get('/logout', (req, res) => {
  res.render('logout', {users: users,
    username: req.session.userID,
    userEmail: req.session.userEmail});
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('logout');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
