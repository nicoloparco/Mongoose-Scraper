const express = require("express");
const router = express.Router();

const axios = require("axios");
const cheerio = require("cheerio");


var Article = require("../models/article.js")
var Comment = require("../models/comment.js")

router.get("/", function(req, res) {
    res.redirect("/articles");
});

router.get("/scrape", function(req, res) {
    axios.get("http://www.theverge.com").then(function(response) {
        
    var $ = cheerio.load(response.data);
    

    $(".c-entry-box--compact__title").each(function(i, element) {
        var result = {};

        result.title = $(this)
            .children("a")
            .text();
        result.link = $(this)
            .children("a")
            .attr("href");

        Article.create(result)
        .then(function(dbArticle){
            console.log(dbArticle)
        }).catch(function(err){
            console.log(err)
        });
    
        res.redirect("/")
        
        });
    });
});

router.get("/articles", function(req, res){
    Article.find({})
        .then(dbArticle => {
            console.log(dbArticle)
            res.render("index", {
                article: dbArticle
            })
        })
        .catch(function(err) {
            console.log(err);
        });
    });

router.get("/articles.json", function(req, res){
    Article.find({}, function(err, doc){
        if (err){
            console.log(err)
        } else {
            res.json(doc)
        }
    });
});


router.get("/clearAll", function(req, res){
    Article.remove({}, function(err, doc){
        if (err){
            console.log(err)
        } else {
            console.log("Cleared all articles")
        }
    });
    res.redirect("/articles.json")
});

router.get("/readArticle/:id", function(req, res) {
    var articleId = req.params.id;
    var hbsObj = {
        article: [],
        body: []
    };

    Article.findOne({_id: articleId})
    .populate("comment")
    .then(function(err, dbArticle){
        if (err) {
            console.log("Error: " + err)
        } else {
            
            hbsObj.article = dbArticle;
            var link = dbArticle.link;
            
            axios.get(link).then(function(response){
                
                var $ = cheerio.load(response.data);
                
                $(".l-col_main").each(function(i, element){
                    hbsObj.body = $(this).children(".c=entry-content").children("p").text();
                    res.render("article", hbsObj);
                    return false;
                });
            });
        }
    });
});

router.post("/comment/:id", function(req, res){
    var user = req.body.name;
    var content = req.body.comment;
    var articleId = req.params.id;

    var commentObj = {
        name: user,
        body: content
    };

    var newComment = new Comment(commentObj);

    newComment.save(function(err, doc){
        if (err){
            console.log(err);
        } else {
            console.log(doc._id);
            console.log(articleId);

            Article.findOneAndUpdate(
                { _id: req.params.id },
                { $push: {comment: doc._id}} ,
                { new: true }
                ).exec(function(err, doc){
                    if (err) {
                        console.log(err)
                    } else {
                        res.redirect("/readArticle/" + articleId)
                    }
                });
        }
    });
});


module.exports = router;

