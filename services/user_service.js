const bcrypt = require('bcrypt');

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
  'user1': {
    id: 'user1',
    email: 'user@example.com',
    password:  bcrypt.hashSync('bonkers', 10)
  },
 'user2': {
    id: 'user2',
    email: 'user2@example.com',
    password:  bcrypt.hashSync('bonkers', 10)
  }
};

function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

const findLink = (username) => {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === username && !userURLs[shortURL]) {
       userURLs[shortURL] = urlDatabase[shortURL].link;
    }
  }
  return userURLs;
};

const findUserLogin = (email) => {
  for (let registered in users) {
    if(users[registered].email === email) {
      let user = users[registered];
      return user;
    }
  }
  return user;
}

const findUser = (email) => {
  for (let registered in users) {
    if (users[registered].email === email) {
      return true;
    }
  }
  return false;
}


const findUserEmail = (id) => {
  for (let registered in users) {
    if(users[registered].id === id) {
      let userEmail = users[registered].email ;
      return userEmail
    }
  }
  return userEmail
}



module.exports = {
  randomString,
  urlDatabase,
  users,
  findLink,
  findUserLogin,
  findUser,
  findUserEmail
};
