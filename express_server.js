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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, user: undefined};
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

app.get("/urls/new", (req, res) => {
  const templateVars = {user: undefined}
  if(req.cookies && req.cookies.user_id){
  templateVars.user = users[req.cookies.user_id];
  res.render("urls_new", templateVars);
  }
  res.render("urls_new",templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: undefined};
  if(req.cookies && req.cookies.user_id){
   templateVars.user = users[req.cookies.user_id];
   res.render("urls_show", templateVars);
  }
  res.render("urls_show", templateVars);
});
// redirect to original longURL website
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  } else {
    res.send("404 URL no Found");
  }
  
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Posts
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  
  res.redirect(`/urls/${shortURL}`);
});

// handle editing long url
app.post("/urls/:id", (req,res) => {
  const newURL = req.body.newURL;
  if (newURL) {
    urlDatabase[req.params.id] = newURL;
    res.redirect("/urls")
  }
});
// handle Delete POSt
app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
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


