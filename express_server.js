const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Functions
//generates random 6 character string
function generateRandomString() {
  let randomString = "";
  // alphanumericChars are A-Z capital a-z lowercase and 0-9
  let alphaNumericChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrdtuvwxyz";
  while(randomString.length < 6) {
    randomString += alphaNumericChars.charAt((Math.ceil(Math.random() * alphaNumericChars.length)));
  };
  return randomString;
}

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

//users database
const users = {
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// main page
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlForUser(req.cookies.user_id), user: undefined};
  if (req.cookies && req.cookies.user_id) {
    templateVars.user = users[req.cookies.user_id];
    
  }
  
  res.render("urls_index", templateVars);
});
// rendering registeration page
app.get("/register", (req, res) => {
  const templateVars = {user: undefined};
  res.render("urls_registeration", templateVars);
});

//  rendering login page
app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls")
  } else {
    
    const templateVars = {user: undefined};
     res.render("urls_login", templateVars);

  }

});
// renders new createurl page
app.get("/urls/new", (req, res) => {
  const templateVars = {user: undefined}
  if(req.cookies && req.cookies.user_id){
  templateVars.user = users[req.cookies.user_id];
  res.render("urls_new", templateVars);
  }
  res.render("urls_login",templateVars);
});

// renders url edit page
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: undefined};
    if (req.cookies && req.cookies.user_id) {
    templateVars.user = users[req.cookies.user_id];
    res.render("urls_show", templateVars);
    }
    res.render("urls_show", templateVars);

  } else {
    res.status(404).send("the requested short URL does not exists");
  }
  
});
// redirect to original longURL website
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("404 URL not Found");
  }
  
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Posts
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  if (req.cookies.user_id) {
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies.user_id};
  res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect("/urls");
  }
});

// handle editing long url
app.post("/urls/:id", (req,res) => {
  const userid = req.cookies.user_id;
  const newURL = req.body.newURL;
  const userURLs = urlForUser(userid);
  
  if (Object.keys(userURLs).includes(req.params.id)) {
    if (newURL) {
      urlDatabase[req.params.id] = {longURL: newURL, userID: userid};
      res.redirect("/urls")
    }

  } else {
     res.status(401).send("You are not authorized to edit");
  }
  
});
// handle Delete POSt
app.post("/urls/:shortURL/delete", (req,res) => {
  const userid = req.cookies.user_id;
  const userURLs = urlForUser(userid);
  if (!userid) {
    return res.status(401).send("You are not authorized to delete");
  }
  if (Object.keys(userURLs).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send(" You are not authorized to delete");
  }
  
});

// registeration handling
app.post("/register", (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    res.status(400).send("User did not enter all required fields")
  }

  if(emailExists(email)) {
    res.status(400).send("This email already in use");
  }
  if(!emailExists(email)) {
    const id = generateRandomString();
    users[id] = {id: id, email: email, password: password};
    res.cookie("user_id", id);
    res.redirect("/urls");
  }

  
})

// login post
app.post("/login",(req, res) => {
  const {email, password} = req.body;

  if (!emailExists(email)) {
    res.status(403).send("No such account found");
  }

  if(emailExists(email)) {
    const id = getUserIdFromEmail(email);
    if (password === users[id].password) {
    res.cookie("user_id", id);
    res.redirect("/urls");
    } else {
      res.status(403).send("Password does not match");
    }
  }

});

//logout post and reset cookie
app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  return res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const emailExists = function(email) {

  for (const account in users) {
    if (users[account].email === email) {
      return true;
    }
  }

  return false;
}

const getUserIdFromEmail = function(email) {

  for (const acc in users) {
    if (users[acc].email === email) {
      return users[acc].id;
    }
  }

  return false;
}

const urlForUser = function(userId) {
  const userUrls = {};

  for (const urls in urlDatabase) {
    if (urlDatabase[urls].userID === userId) {
      userUrls[urls] = urlDatabase[urls];
    }
  }
  return userUrls;
}


