const { assert } = require('chai');

const {emailExists, getUserIdByEmail, urlForUser} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "userRandomID"

  },
  "9sm5xK": {
      longURL: "http://www.google.com",
      userID: "userRandomID"

  }
};

describe('getUserIdByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserIdByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    
    assert.strictEqual(user, expectedUserID);
  });
});

describe('urlForUser', function() {
  it('should return an object with user urls and id', function() {
    const user = urlForUser("userRandomID", urlDatabase)
    const expectedObj = {
        "b2xVn2": {
          longURL: "http://www.lighthouselabs.ca",
          userID: "userRandomID"
    
      },
      "9sm5xK": {
          longURL: "http://www.google.com",
          userID: "userRandomID"
    
      }

    };
    
    assert.deepEqual(user, expectedObj);
  });

  
});



describe('emailExists', function() {
  it('should return true if email exists', function() {
    const user = emailExists("user@example.com", testUsers)
    const expected = true;
    
    assert.strictEqual(user, expected);
  });
});
