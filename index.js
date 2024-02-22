const express = require("express");
const { connectToMongoDB } = require("./connect");
const { nanoid } = require('nanoid');
const ejs = require("ejs");
const bodyParser = require("body-parser");
const URL = require('./models/url');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
    console.log(req.headers.host);
    res.render(__dirname + "/views/index.ejs");
});

app.post("/", async (req, res) => {
    const mainURL = req.body.longURL;
    const short = nanoid(4);

    try {
        const newURL = new URL({
            shortendURL: short,
            redirectURL: mainURL,
            visited: [],
        });

        await URL.insertMany([newURL]);

        const slang = `${req.headers.host}/u/${short}`;
        res.render(__dirname + "/views/success.ejs", { url: slang });
    } catch (error) {
        console.error("Error inserting into MongoDB:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/u/:shortId", async (req, res) => {
    const shortId = req.params.shortId;

    try {
        const entry = await URL.findOneAndUpdate(
            { shortendURL: shortId },
            {
                $push: {
                    visited: {
                        timestamp: Date.now(),
                    },
                }
            }
        );

        if (entry) {
            console.log(entry.redirectURL);
            res.redirect(entry.redirectURL);
        } else {
            res.status(404).send("Not Found");
        }
    } catch (error) {
        console.error("Error finding and updating in MongoDB:", error);
        res.status(500).send("Internal Server Error");
    }
});

const PORT = process.env.PORT || 8001;
const MONGODB_URI = process.env.MONGOURI;

const startServer = async () => {
    try {
        await connectToMongoDB(MONGODB_URI);
        console.log('MongoDB connected');
        app.listen(PORT, () => {
            console.log(`Server started at port: ${PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

startServer();
