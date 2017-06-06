const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

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

app.get('/hello', (req,res) => {
  res.end('<html><body>Hello<b>world</b><body></html>\n');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  console.log(typeof templateVars);
  console.log(templateVars);
  res.render('urls_index', templateVars);

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});