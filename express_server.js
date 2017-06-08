const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  "user1ID": {
    id: "user1",
    email: "user@example.com",
    password: "bananas"
  },
 "user2ID": {
    id: "user2",
    email: "user2@example.com",
    password: "bonkers"
  }
}

app.get('/', (req, res) => {
  res.end('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//say hello for /hello page
app.get('/hello', (req, res) => {
  res.end('<html><body>Hello<b>world</b><body></html>\n');
});

//call the urls_index.ejs file to display for /urls page
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase,
                       username: req.cookies["username"]
                     };
  res.render('urls_index', templateVars);
});

//call urls_new.ejs to display for /urls/new page
app.get('/urls/new', (req, res) => {
  let templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get('/register', (req, res) => {
  res.render('registration', {username:req.cookies['username']});
})

app.post('/register', (req, res) => {
  const userID = rando(6);
  if(!req.body.email||!req.body.password) {
    res.sendStatus(403);
  }

  const findUser = (email) => {
    let flag = false;
    for (let registered in users) {
      if (users[registered].email === email) {
        console.log(users[registered].email);
        console.log("we found a duplicate email");
        // return users[registered]
        flag = true;
        return flag;
      }
    }
  }

  console.log(findUser(req.body.email));

  if (findUser(req.body.email)) {
    res.sendStatus(403);
  }

  if (!users[userID]) {
    users[userID] = { id: userID,
                      email: req.body.email,
                      password: req.body.password }
  }

  console.log(users);
  res.cookie('username', userID);
  res.redirect('/urls')

});//for app.post

//login page
app.get('/login', (req, res) => {
  res.render("login", {username:req.cookies['username']});
});

//set cookie when submit log in form, redirect to log in page
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/login');
})

//clear cookie when submit log out form, redirect to /urls
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})
//generate random shortURL for longURL submitted through form
//put in urlDatabase object, redirect
app.post('/urls', (req, res) => {
  let shortURL = rando(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('http://localhost:3000/urls/' + shortURL);
});

//delete from database when click button
//redirect to /urls page
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//display shortURL on new after form submitted
//(realistically: any link that says /url/xxx displays xxx)
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       username: req.cookies["username"]
                     };
  res.render('urls_show', templateVars);
});

//updating longURL on its shortURL page
//redireting to shortURL page
app.post("/urls/:id", (req, res) => {
  // let shortURL = req.originalUrl.slice(6);
  // console.log(req.params.id);
  let shortURL = req.params.id
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect(shortURL);//why does this work??
});

//redirects to actual website of longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//random string generating function
let rando = function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}