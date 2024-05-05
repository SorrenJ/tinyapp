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

// This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");


app.use(cookieParser());

// Handles POST request. Middleware, parses incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// User database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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






// GET /login endpoint that responds with this new login form template
app.get("/login", (req, res) => {
  const templateVars = {
    userInfo: users[req.cookies["user_id"]]
  };

  res.render("login", templateVars);
});


// Login route
app.post("/login", (req, res) => {
  const email = req.body.email; // from the input form
  
  const user = findUserByEmail(req.body.email);

  if (!user) {
    return res.status(403).send('email cannot be found');
  }

  if (user) {
    if (users[user].password !== req.body.password) {
      return res.status(403).send('incorrect password!');
    }
  }
  
  
  res.cookie("user_id", findUserByEmail(email));
  res.redirect("/urls/");
});




// Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // clears the submitted user cookie
  res.redirect("/urls/");
});






app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
// Output for http://localhost:8080/urls.json
// {"b2xVn2":"http://www.lighthouselabs.ca","9sm5xK":"http://www.google.com"}


app.get("/u/:id", (req, res) => {
  let shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
 // res.send("Ok"); // Respond with 'Ok' (we will replace this)


  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; // assign user-inputted longURL to a generated shortURL


  res.redirect(`/urls/${shortURL}`);









});


// render urls_index page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userInfo: users[req.cookies["user_id"]] // displays the username
  };
  res.render("urls_index", templateVars);
});

// route to delete url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  delete urlDatabase[id];

  res.redirect("/urls/");
});

// route to register
app.get("/register", (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

// registration handler
app.post("/register", (req, res) => {
  let userObj = {};
  let userID = generateRandomString();

  
  if (req.body.email === "" || req.body.password === "") {
    
    // if user has empty email/password
    return res.status(400).send('cannot have an empty email or password');
  }

  const user = findUserByEmail(req.body.email);

  // if user already exists
  if (user) {
    return res.status(400).send('Email already in use');
  }
  
  
  
  
  
  
  res.cookie("user_id", userID);

  userObj.id = userID;
  userObj.email = req.body.email;
  userObj.password = req.body.password;
  users[userID] = userObj;
  console.log(users);
  res.redirect('/urls');
});

// render urls_show page
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], userInfo: users[req.cookies["user_id"]] }; // displays the username
  res.render("urls_show", templateVars);
});

// render urls_new page
app.get("/urls/new", (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };
  res.render("urls_new");
});

// route to update url
app.post("/urls/:id", (req, res) => {
  let shortId = req.params.id; // if the info is coming from the URL
  let longURL = req.body.longURL; // if the info is coming from the input form

  urlDatabase[shortId] = longURL;

  res.redirect("/urls/");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});