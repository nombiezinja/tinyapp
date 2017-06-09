const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  secret: 'Sometimes I listen to John Newman.',
}));
// app.use(function (err, req, res, next) {
//   console.error(err.stack);
//   res.status(403).render('error403');
// });
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
};

const users = {
  'user1ID': {
    id: 'user1',
    email: 'user@example.com',
    password:  bcrypt.hashSync('bonkers', 10)
  },
 'user2ID': {
    id: 'user2',
    email: 'user2@example.com',
    password:  bcrypt.hashSync('bonkers', 10)
  }
};

const findLink = (username) => {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === username && !userURLs[shortURL]) {
       userURLs[shortURL] = urlDatabase[shortURL].link;
    }
  }
  return userURLs;
};


// app.get('/', (req,res, next) => {
//   res.locals.user = userService.find(req.cookie.userId);
//   next();
// });


//call the urls_index.ejs file to display for /urls page
app.get('/urls', (req, res) => {
  //use array, push every array found, then on views page
  //change desplay method to array method
  const userUniqueUrl = findLink(req.session.userID);

  let templateVars = { urls: userUniqueUrl,
                       username: req.session.userID,
                       users: users
                     };

  res.render('urls_index', templateVars);
});

//call urls_new.ejs to display for /urls/new page
app.get('/urls/new', (req, res) => {
  let templateVars = { username: req.session.userID,
                       users: users};
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  res.render('registration', {username: req.session.userID});
})

//registration submission
app.post('/register', (req, res) => {
//if no data submitted

  if(!req.body.email||!req.body.password) {
    res.status(403).send('Oops, you must enter an email and a password!');  // TODO: double check that jeremy didn't ruin this
  }
//if email already exists
  const findUser = (email) => {
    for (let registered in users) {
      if (users[registered].email === email) {
        return true;
      }
    }
    return false;
  }

  console.log(findUser(req.body.email));

  if (findUser(req.body.email)) {
    res.status(403).send('Oops, looks like that email was already taken!');
  }

  const userID = rando(6);
  if (!users[userID]) {
    users[userID] = { id: userID,
                      email: req.body.email,
                      password: bcrypt.hashSync(req.body.password, 10) }
  } else {
    //  ?????do a while loop here later
  }

  console.log(users);
  req.session.userID = userID;
  res.redirect('/urls')

});//for app.post

//login page
app.get('/login', (req, res) => {
  res.render('login', {users: users,
                       username:req.session.userID});
});

//set cookie when submit log in form, redirect to log in page
app.post('/login', (req, res) => {

  const userEmail = req.body.email
  //search to see if username matches database
  const findUser = (email) => {
    for (let registered in users) {
      if(users[registered].email === email) {
        let user_ID = users[registered]
        return user_ID;
      }
    }
  }

   //search to see if password matches username
  if(!findUser(userEmail)) {
    res.status(403).send('Oops, looks like this email hasn\'t been registered yet.');
  } else {
    let user_ID = findUser(userEmail);
    if (bcrypt.compareSync(req.body.password, user_ID.password)) {
      req.session.userID = user_ID.id;


      // res.cookie ('username', user_ID.id);
      res.redirect('/login');
    } else {
      res.status(403).send('Oops, looks like you have entered the wrong information. Yoink!');
    }
  }

})

//generate random shortURL for longURL submitted through form
//put in urlDatabase object, redirect
app.post('/urls', (req, res) => {
  let shortURL = rando(6);
  console.log(shortURL);
  console.log(urlDatabase[shortURL]);
  console.log(urlDatabase);
  console.log(urlDatabase.b2xVn2);
  if (!urlDatabase[shortURL]){
    urlDatabase[shortURL] = { link: req.body.longURL,
                              userID : req.session.userID};
    res.redirect('http://localhost:3000/urls/' + shortURL);
  };
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

  const userUniqueUrl = findLink(req.session.userID);

  let templateVars = { userUrls: userUniqueUrl,
                       allUrls:  urlDatabase,
                       shortURL: req.params.id,
                       username: req.session.userID,
                       users: users
                     };

  if(!req.session.userID) {
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
  urlDatabase[shortURL].link = req.body.newURL;
  res.redirect(shortURL);//why does this work??
});

//redirects to actual website of longURL
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].link;
  res.redirect(longURL);
});

// app.use((req,res,next) => {
//   res.status(403).render('error403', {username: req.session.userID,
//                        users: users})
// });


//clear cookie when submit log out form, redirect to /urls
app.get('/logout', (req, res) => {
  res.render('logout', {users: users,
                        username:req.session.userID});
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('logout');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//random string generating function
let rando = function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}