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
  secret: 'I listen to John Newman unironically.',
}));

app.set('view engine', 'ejs');




app.get('/', (req,res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//call the urls_index.ejs file to display for /urls page
app.get('/urls', (req, res) => {
  //use array, push every array found, then on views page
  //change desplay method to array method
  const userUniqueUrl = findLink(req.session.userID);

  let templateVars = { urls: userUniqueUrl,
                       username: req.session.userID,
                     };

  if(!req.session.userID) {
    res.render('urls_index', templateVars);
  } else {
  res.render('urls_index_loggedin', templateVars);
  }
});

//call urls_new.ejs to display for /urls/new page
app.get('/urls/new', (req, res) => {
  let templateVars = { username: req.session.userID,
                       users: users};
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  if(req.session.userID) {
    res.redirect('/urls');
  } else {
  res.render('registration', {username: req.session.userID});
  }
})

//registration submission
app.post('/register', (req, res) => {
//if no data submitted

  if(!req.body.email||!req.body.password) {
    res.status(403).send('Oops, you must enter an email and a password!');  // TODO: double check that jeremy didn't ruin this
  }
//if email already exists
  console.log(findUser(req.body.email));

  if (findUser(req.body.email)) {
    res.status(403).send('Oops, looks like that email was already taken!');
  }

  let userId;
  do {
      userID = rando(8);
  } while(users[userID])


    users[userID] = { id: userID,
                      email: req.body.email,
                      password: bcrypt.hashSync(req.body.password, 10) }



  console.log(users);
  console.log(res.locals);
  req.session.userID = userID;
  res.redirect('/urls')

});//for app.post

//login page
app.get('/login', (req, res) => {
  if(!req.session.userID) {
    res.render('login', {users: users,
                       username:req.session.userID} );
  } else {
    res.render('loggedin', {users: users,
                       username:req.session.userID})
  }
});

//set cookie when submit log in form, redirect to log in page
app.post('/login', (req, res) => {

  const userEmail = req.body.email
  //search to see if username matches database

   //search to see if password matches username
  if(!findUserLogin(userEmail)) {
    res.status(403).send('Oops, looks like this email hasn\'t been registered yet.');
  } else {
    let user = findUserLogin(userEmail);
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.userID = user.id;


      // res.cookie ('username', user.id);
      res.redirect('/login');
    } else {
      res.status(403).send('Oops, looks like you have entered the wrong information. Yoink!');
    }
  }

})

//generate randomString shortURL for longURL submitted through form
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
 //note to self-issa object
 const userUniqueUrl = findLink(req.session.userID);

 let templateVars = { userUrls: userUniqueUrl,
                      urls:  urlDatabase,
                      shortURL: req.params.id,
                      username: req.session.userID,
                      users: users
                    };
  if(!userUniqueUrl[req.params.shortURL]) {
    res.render('no_access',{username: req.session.userID})
  } else {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
  }
});

//fix this
app.get('/urls/:shortURL/delete', (req, res) => {

  const userUniqueUrl = findLink(req.session.userID);

  if(!userUniqueUrl[req.params.shortURL]) {
    res.render('no_access',{username: req.session.userID})
  }else {
  res.redirect('/urls')

  }

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
  console.log(`TinyApp listening on port ${PORT}!`);
});

