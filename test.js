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

console.log(users.user2ID.password);
// for (const userID in users) {

//   // if(userID.hasOwnProperty('user@example.com')){
//   //    console.log("it worked");

//   //  }

//   // if ('user@example.com' in userID.email) {
//     // console.log('it worked');
//   // }
//   console.log(userID.email)
//   console.log(typeof userID.email)
//   console.log(typeof userID)

// }

// const obj = {
//   'john' :{
//     age: '23',
//     food: 'burger',
//   },
//   'nancy' :{
//     age:'33',
//     food:'noodles',
//   }
// }

// for (const name in obj) {
//   console.log(typeof name);
// }