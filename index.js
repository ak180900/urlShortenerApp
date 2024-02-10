const express = require("express");
const { connectToMongoDB } = require("./connect");
const { nanoid } = require('nanoid');

// const { handleGenerateNewShortURL } = require("./controller/url");
const bodyParser = require("body-parser");


const URL = require('./models/url');
// const urlRoute = require('./routes/url');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));

// const PORT = 8001;

connectToMongoDB("mongodb+srv://ak18092000:dbpass123@cluster0.cc0d2ru.mongodb.net/urlShortnerApp")
    .then(() => console.log('Mongodb connected'));

app.use(express.json());

// app.use("/url", urlRoute);
app.get("/", function(req, res) {
    res.render("index.ejs");
});

app.post("/", async function(req, res) {
    const mainURL = req.body.longURL;
    // console.log(mainURL);

    // if(!body.url)
    // {
    //     return res.status(400).json({ error: "url is required" });
    // }
    const short = nanoid(8);

    await URL.create( {
        shortendURL: short, 
        redirectURL: mainURL,
        visited: [],
    });

    const slang = "http://localhost:8001/" + short;

    res.render("success.ejs", {url: slang});


    // return res.json({ id: short });
});


app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    console.log(shortId);
    const entry = await URL.findOneAndUpdate(
        {
            shortendURL: shortId,
        },
        {
            $push: {
                visited: {
                    timestamp: Date.now(),
                },
            }
        }
    );
    
    // console.log(entry);
    console.log(entry.redirectURL);
    res.redirect(entry.redirectURL);
    
});

let PORT = process.env.PORT;
if(PORT == null || PORT == "")
{
  PORT = 8001;
}
app.listen(PORT, function () {
    console.log("server started at port : " + PORT);
});