const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


// This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
// Output for http://localhost:8080/urls.json
// {"b2xVn2":"http://www.lighthouselabs.ca","9sm5xK":"http://www.google.com"}

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });
// Output for http://localhost:8080/hello
// Hello World

// Output for curl -i http://localhost:8080/hello
// <html><body>Hello <b>World</b></body></html>

// app.get("/set", (req, res) => {
//     const a = 1;
//     res.send(`a = ${a}`);
//   });
  
//   app.get("/fetch", (req, res) => {
//     res.send(`a = ${a}`);
//   });
// Output
// for fetch ReferenceError: a is not defined



app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});