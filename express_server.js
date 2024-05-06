const express = require("express");
const cookieParser = require("cookie-parser");
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

const urlsForUser = function(id) {
  let outputObj = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      outputObj[shortURL] = urlDatabase[shortURL];
    }
  }

  return outputObj;
};

// This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

app.use(cookieParser());

// Handles POST request. Middleware, parses incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

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
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const findUserByEmail = (email) => {
  for (const userId in users) {
    const userFromDb = users[userId];

    if (userFromDb.email === email) {
      // User is found
      return userFromDb;
    }
  }

  return null;
};

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  next();
};

// Middleware to check if user is logged in and redirect from /register and /login
const redirectToUrlsIfLoggedIn = (req, res, next) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  next();
};

// 2. If someone is not logged in, redirects to the /login page: 
// Middleware to check if user is not logged in and redirect from /urls/new
const redirectToLoginIfNotLoggedIn = (req, res, next) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  next();
};
// end of 2

// 1. If someone is logged in and visits /register or /login pages, they will be redirected to /urls:

// GET /register endpoint

app.get("/register", redirectToUrlsIfLoggedIn, (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

// GET /login endpoint
app.get("/login", redirectToUrlsIfLoggedIn, (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});


// end of 1

// 3. If someone is not logged in and visits /urls/new, they will be redirected to /login:
// GET /urls/new endpoint
app.get("/urls/new", redirectToLoginIfNotLoggedIn, (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});
// end of 3

// GET /urls endpoint
app.get("/urls", (req, res) => {
    
  // Checks if for registered user can view URLS
    if (!req.cookies["user_id"]) {
      return res.status(401).send('Cannot view "My URLs", you are not logged in');
    }
  
  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    userInfo: users[req.cookies["user_id"]], // displays the username
  };



  res.render("urls_index", templateVars);
});


// 4. If someone makes a POST request to /urls and they are not logged in, they should see a relevant error message:
// POST /urls endpoint
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send('You are not logged in');
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  const templateVars = { userInfo: users[req.cookies["user_id"]] };
  res.redirect(`/urls/${shortURL}`);
});
// end of 4

// 5. If someone makes a request for a url that doesn't exist (no url with provided id in our database), they should see a relevant error message:
// 6. Every user should be able to visit /u/:id whether they are logged in or not:
// GET /u/:id endpoint
app.get("/u/:id", (req, res) => {
  let shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  if (!longURL) {
    return res.status(404).send('Shortened URL does not exist');
  }
  res.redirect(longURL);
});
// end of 5 and 6

// GET /urls/:id endpoint
app.get("/urls/:id", requireLogin, (req, res) => {
  const specificURL = urlsForUser(req.cookies["user_id"]);

  if (!specificURL[req.params.id]) {
    return res.status(401).send("Cannot access these URLs!");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userInfo: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

// POST /urls/:id endpoint
app.post("/urls/:id", requireLogin, (req, res) => {
  let shortId = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortId] = { longURL: longURL, userID: req.cookies["user_id"] };
  res.redirect("/urls/");
});

// POST /urls/:id/delete endpoint
app.post("/urls/:id/delete", requireLogin, (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls/");
});

// POST /logout endpoint
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // clears the submitted user cookie
  res.redirect("/login");
});

// POST /login endpoint
app.post("/login", (req, res) => {
  const email = req.body.email; // from the input form
  const user = findUserByEmail(req.body.email);

  if (!user) {
    return res.status(403).send('Email cannot be found');
  }

  if (user.password !== req.body.password) {
    return res.status(403).send('Incorrect password!');
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls/");
});

// POST /register endpoint
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('Cannot have an empty email or password');
  }

  const user = findUserByEmail(req.body.email);
  if (user) {
    return res.status(400).send('Email already in use');
  }

  let userID = generateRandomString();
  res.cookie("user_id", userID);
  users[userID] = { id: userID, email: req.body.email, password: req.body.password };
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
