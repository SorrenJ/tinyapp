# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product
Edit URL page -> urls_show.ejs -> /urls/:id

!["Screenshot of Edit URL page"](https://github.com/SorrenJ/tinyapp/blob/main/doc/edit-url-page.png?raw=true)

My URLs page -> urls_index.ejs -> /urls

!["Screenshot of URLs page"](https://github.com/SorrenJ/tinyapp/blob/main/doc/url-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command.
- Install `npm install mocha chai@4.3.1 --save-dev` for unit testing, and run `npm test` to confirm your test passes. 

## Cheat Codes for testing purposes

Registered accounts for testing purposes:

    id: userRandomID,
    email: user@example.com,
    password: purple-monkey-dinosaur

    id: user2RandomID,
    email: user2@example.com,
    password: dishwasher-funk

Registered Short URLS for testing purposes:

    Short URL: b6UTxQ
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",

    Short URL: i3BoGr
    longURL: "https://www.google.ca",
    userID: "aJ48lW",


## Notes

On the Edit URL page, leaving the new url field blank makes this an empty url for the short url. Just click on "My URLs" on the header to bypass. Might fix this issue in the near future.

!["Screenshot of Edit URL page"](https://github.com/SorrenJ/tinyapp/blob/main/doc/edit-url-page.png?raw=true)