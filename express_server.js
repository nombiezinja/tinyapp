const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(403).render('error403');
});
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': {
    link : 'http://www.lighthouselabs.ca',
    userID: 'user1'
  },
  '9sm5xK': {
    link : 'http://www.google.com',
    userID: 'user2'
  },
  '8jf92V': {
    link : 'http://www.gmail.com',
    userID: 'user1'
  }
}



const users = {
  'user1ID': {
    id: 'user1',
    email: 'user@example.com',
    password: 'bananas'
  },
 'user2ID': {
    id: 'user2',
    email: 'user2@example.com',
    password: 'bonkers'
  }
}

const findLink = (username) => {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === username && !userURLs[shortURL]) {
       userURLs[shortURL] = urlDatabase[shortURL].link;
    }
  }
  return userURLs;
}
// app.use(handleErrors);



// function handleErrors(err, req, res, next) {
//   res.send('/errors');
// }

// app.get('/', (req,res, next) => {
//   res.locals.user = userService.find(req.cookie.userId);
//   next();
// });



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
  //use array, push every array found, then on views page
  //change desplay method to array method
  const userUniqueUrl = findLink(req.cookies['username']);

  let templateVars = { urls: userUniqueUrl,
                       username: req.cookies['username'],
                       users: users
                     };
  res.render('urls_index', templateVars);
});

//call urls_new.ejs to display for /urls/new page
app.get('/urls/new', (req, res) => {
  let templateVars = { username: req.cookies['username'],
                       users: users};
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  res.render('registration', {username:req.cookies['username']});
})

//registration submission
app.post('/register', (req, res) => {
  const userID = rando(6);
//if no data submitted
  if(!req.body.email||!req.body.password) {
    res.sendStatus(403);
  }
//if email already exists
  const findUser = (email) => {
    let flag = false;
    for (let registered in users) {
      if (users[registered].email === email) {
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
  res.render('login', {users: users,
                       username:req.cookies['username']});
});

//set cookie when submit log in form, redirect to log in page
app.post('/login', (req, res) => {

  const userEmail = req.body.email
  //search to see if username matches database
  const findUser = (email) => {
    for (let registered in users) {
      if(users[registered].email === email) {
        let user_ID = users[registered]
        return user_ID
      }
    }
  }

   //search to see if password matches username
  if(!findUser(userEmail)) {
    res.sendStatus(403);
  } else {
    let user_ID = findUser(userEmail);
    if (user_ID.password === req.body.password) {
      res.cookie ('username', user_ID.id);
      res.redirect('/login');
    } else {
      res.sendStatus(403);
    }
    // console.log(user_ID);

  }

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
app.get('/urls/:id', (req, res) => {

  const userUniqueUrl = findLink(req.cookies['username']);

  let templateVars = { userUrls: userUniqueUrl,
                       allUrls:  urlDatabase,
                       shortURL: req.params.id,
                       username: req.cookies['username'],
                       users: users
                     };

  if(!req.cookies['username']) {
    res.render('registration', templateVars);
  } else {
  res.render('urls_show', templateVars);
  }
});

//updating longURL on its shortURL page
//redireting to shortURL page
app.post('/urls/:id', (req, res) => {
  // let shortURL = req.originalUrl.slice(6);
  let shortURL = req.params.id
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect(shortURL);//why does this work??
});

//redirects to actual website of longURL
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// app.use((req,res,next) => {
//   res.status(403).render('error403', {username: req.cookies['username'],
//                        users: users})
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//random string generating function
let rando = function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}