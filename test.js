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
var username = "user1"

const findlink = (username) => {
  const userURL = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === username && !userURL[shortURL]) {
       userURL[shortURL] = urlDatabase[shortURL].link;
    }
  }
  return userURL
}

console.log(findlink(username));
// for (let shortURL in urlDatabase) {
//   console.log(urlDatabase[shortURL].userID)
// }

// for (let userID in users) {
//   console.log(users[userID].id)
// }



