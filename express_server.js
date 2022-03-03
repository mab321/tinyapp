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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username: undefined};
  if (req.cookies && req.cookies.username) {
    templateVars.username = req.cookies.username;
    
  }
  
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: undefined}
  if(req.cookies && req.cookies.username){
  templateVars.username = req.cookies.username;
  res.render("urls_new", templateVars);
  }
  res.render("urls_new",templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: undefined};
  if(req.cookies && req.cookies.username){
   templateVars.username = req.cookies.username;
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

// login post
app.post("/login",(req, res) => {
  const {userName} = req.body;
  if(userName) {
    res.cookie("username",userName);
    res.redirect("/urls");
  } else {
    res.status(403).send("Cannot enter empty username"); 
  }

});

//logout post and reset cookie
app.post("/logout", (req,res) => {
  res.clearCookie("username");
  return res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
