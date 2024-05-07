const express = require("express");
var cookieSession = require('cookie-session');
const { getUserByEmail } = require("./helpers");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  let strOutput = "";
  let lettersAndNumArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  for (let i = 0; i < 6; i++) {
    let randomLetter = lettersAndNumArr[Math.floor(Math.random() * 61)];
    strOutput += randomLetter;
  }

  return strOutput;
}

// Create a function named urlsForUser(id) which returns the URLs where the userID is equal to the id of the currently logged-in user:
const urlsForUser = function(id) {
  let outputObj = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      outputObj[shortURL] = {
        longURL: urlDatabase[shortURL].longURL,
        userID: id
      };
    }
  }
  
  return outputObj; 
}
// This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

//app.use(cookieParser());
app.use(cookieSession({
  name: 'tinyapp',
  keys: ['secret']
}));

// Handles POST request. Middleware, parses incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// Middleware to check if user is logged in and redirect from /register
const redirectToUrlsIfLoggedIn = (req, res, next) => {
  const path = req.path;
  if (req.session.user_id && path !== "/login" && path !== "/register") {
    return res.redirect("/urls");
  }
  next();
};

// Middleware to check if user is not logged in and redirect to /login
const redirectToLoginIfNotLoggedIn = (req, res, next) => {
  const path = req.path;
  if (!req.session.user_id && path !== "/login") {
    return res.redirect("/login");
  }
  next();
};

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

// User database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },

};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10), // need to hashSync to work for testing
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10), // need to hashSync to work for testing
  },
};

// 1. If someone is logged in and visits /register or /login pages, they will be redirected to /urls:
// GET /register endpoint
app.get("/register", redirectToUrlsIfLoggedIn, (req, res) => {
  const templateVars = { userInfo: users[req.session.user_id] };
  res.render("register", templateVars);
});

// GET /login endpoint
app.get("/login", redirectToUrlsIfLoggedIn, (req, res) => {
  const templateVars = { userInfo: users[req.session.user_id] };
  res.render("login", templateVars);
});
// end of 1

// 2. If someone is not logged in, redirects to the /login page: 
// GET /urls/new endpoint

app.get("/urls/new", redirectToLoginIfNotLoggedIn, (req, res) => {
  const path = req.path;
  const templateVars = { userInfo: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});
// end of 2

// GET /urls endpoint
app.get("/urls", (req, res) => {
  // Checks if for registered user can view URLS
  if (!req.session.user_id) {
    return res.status(401).send('Cannot view "My URLs", you are not logged in');
  }

  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    userInfo: users[req.session.user_id], // displays the username
  };

  res.render("urls_index", templateVars);
});

// 3. If someone makes a POST request to /urls and they are not logged in, they should see a relevant error message:
// POST /urls endpoint
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send('You are not logged in');
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  const templateVars = { userInfo: users[req.session.user_id] };
  res.redirect(`/urls/${shortURL}`);
});
// end of 3

// 4. If someone makes a request for a url that doesn't exist (no url with provided id in our database), they should see a relevant error message:
// 5. Every user should be able to visit /u/:id whether they are logged in or not:
// GET /u/:id endpoint
app.get("/u/:id", (req, res) => {
  let shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  if (!longURL) {
    return res.status(404).send('Shortened URL does not exist');
  }
  res.redirect(longURL);
});
// end of 4 and 5

// GET /urls/:id endpoint
// Ensure the GET /urls/:id page returns a relevant error message to the user if they are not logged in:
app.get("/urls/:id", requireLogin, (req, res) => {
  const specificURL = urlsForUser(req.session.user_id);

  if (!specificURL[req.params.id]) {
    return res.status(401).send("Cannot access these URLs!");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userInfo: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

// POST /urls/:id endpoint
app.post("/urls/:id", requireLogin, (req, res) => {
  let shortId = req.params.id;
  let longURL = req.body.longURL;
  const userId = req.session.user_id; // Define userId here
  // Check if the URL exists and the user is the owner of the URL
  if (!urlDatabase[shortId] || urlDatabase[shortId].userID !== userId) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }

  urlDatabase[shortId] = { longURL: longURL, userID: req.session.user_id };
  res.redirect("/urls/");
});

// POST /urls/:id/delete endpoint
app.post("/urls/:id/delete", requireLogin, (req, res) => {
  const shortId = req.params.id;
  const userId = req.session.user_id;
  // Check if the URL exists and the user is the owner of the URL
  if (!urlDatabase[shortId] || urlDatabase[shortId].userID !== userId) {
    return res.status(403).send("You do not have permission to delete this URL.");
  }
  delete urlDatabase[shortId]; // Corrected the variable name here
  res.redirect("/urls/");
});

// POST /logout endpoint
app.post("/logout", (req, res) => {
  req.session = null; // clears the submitted user cookie
  res.redirect("/login");
});

// POST /login endpoint
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //const user = getUserByEmail(email);
const userId = getUserByEmail(email, users);
const user = users[userId];
  if (!user) {
    return res.status(403).send('Email cannot be found');
  }

  // Check if the provided password matches the hashed password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Incorrect email or password');
  }

  // Set the user_id session variable to the user's ID
  req.session.user_id = user.id;

  // Redirect to the /urls page
  res.redirect("/urls");
});


// POST /register endpoint
app.post("/register", (req, res) => {
  let userObj = {};
  let userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Cannot have an empty email or password');
  }

  const user = getUserByEmail(email);
  if (user) {    
    return res.status(400).send('Email already in use');
  }

  // Correct usage of setting the session variable
  req.session.user_id = userID;

  userObj.id = userID;
  userObj.email = email;

  const hashedPassword = bcrypt.hashSync(password, 10);
  userObj.password = hashedPassword;
  users[userID] = userObj;
  console.log("users object: ", users);

  res.redirect('/urls');
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello!");
});

// GET /urls.json endpoint
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
