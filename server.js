const express = require('express');
const bodyParser= require('body-parser')
var upload=require('./routes/upload');
var ObjectId = require('mongodb').ObjectID;
const request = require('request');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.listen(3000, function() {
    console.log('listening on 3000')
  })

  const connectionString = 'mongodb+srv://IAMNicoletta:Cambridge1441@cluster0.ybou3.mongodb.net/scientific-articles?retryWrites=true&w=majority'
  MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => { 
    
    const db = client.db('scientific-articles');

    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(express.static('public'))
    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.json())
    const articlesCollection = db.collection('articles');

    app.post('/articles', (req, res) => { 
        upload(req, res,(error) => {
            if(error){
               res.redirect('/?msg=3');
            } else{
                  /**
                   * Create new record in mongoDB
                   */
                  articlesCollection.insertOne({ info: req.body, file: req.file}).then(result => {
                    res.redirect('/')
                  })
                  .catch(error => console.error(error))
            }
          })
        })

    app.post('/delete',(req, res) => {
      var articleId = encodeURIComponent(req.body.articleId);
      console.log(articleId);
      db.collection('articles').deleteOne({ "_id" : ObjectId(articleId) })
      .then(result => {
        res.redirect('/')
      })
      .catch(error => console.error(error))
    })

    app.get('/', (req, res) => {
        db.collection('articles').find().toArray()
            .then(results => {
            res.render('index.ejs', { articles: results })
            })
            .catch(error => console.error(error)) 
      })

    app.put('/articles', (req, res) => {
        console.log("123",req.body)
      })
      
    app.get('/home', (req, res) => {
      res.redirect('/')
    })

    app.post('/article', (req, res) => {
      var string = encodeURIComponent(req.body.idArticle);
      db.collection('articles').find(ObjectId(string)).toArray()
            .then(result => {
            res.render('article.ejs', { article: result, articleId: string })
            })
            .catch(error => console.error(error))
    })

    app.post('/article', (req, res) => {
      var string = encodeURIComponent(req.body.idArticle);
      // res.redirect('article/?idArticle=' + string);
      db.collection('articles').find(ObjectId(string)).toArray()
            .then(result => {
            res.render('article.ejs', { article: result })
            })
            .catch(error => console.error(error))
    })

    app.post('/download', function(req, res){
      const file = `${__dirname}/${req.body.filePath}`;
      res.download(file); // Set disposition and send it.
    });

    app.post('/pubMed', (req, res) => {
      var pubMedId = encodeURIComponent(req.body.pubmedId);
      // res.redirect('article/?idArticle=' + string);
      const pubMedCall = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pubMedId}&retmode=json`
      
      request(pubMedCall, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.render('pubmedinfo.ejs', { info: JSON.parse(body) })
        }
      })
    })
    

  })
  .catch(console.error)