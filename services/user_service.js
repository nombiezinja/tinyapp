const bcrypt = require('bcrypt');

function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}


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



module.exports = {
  randomString,
  urlDatabase,
  users,
};
