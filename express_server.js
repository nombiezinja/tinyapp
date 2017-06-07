const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieParser - require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

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
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//call urls_new.ejs to display for /urls/new page
app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

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
  let templateVars = { shortURL: req.params.id };
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