const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const axios = require("axios");
const cheerio = require("cheerio");

// const db = require("./models");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(logger("dev"));
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(express.static("/public"));

const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, {useNewUrlParser: true}, function(){
    console.log("Connected to Mongoose")
});

const routes = require("./controller/controller.js");
app.use("/", routes);
















app.listen(PORT, function() {
    console.log("Listening on PORT " + PORT)
})

