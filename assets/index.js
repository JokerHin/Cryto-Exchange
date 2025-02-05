const express = require("express");
const axios = require("axios");
const rateLimit = require('express-rate-limit');
const cors = require('cors'); // Import CORS middleware
const config = require("./config.json")

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 20,
    message: "Too many requests from this IP, please try again later.",
    keyGenerator: (req) => req.ip, 
});

app.use(limiter);

app.post('/events', async (req, res) => {
    let { data } = await axios.get(`https://tg.i-c-a.su/json/${config.vouchChannel}?limit=50`)

    if (data?.messages?.length > 0) {
        let messages = data.messages.map(A => ({ from: A?.fwd_from?.from_name ?? A?.fwd_from?.from_id ?? `Telegram User`, message: A.message.replace(/<[^>]*>/g, '').replace(/[^a-zA-Z0-9@$ ]/g, '') }))
        res.status(200).json({ data: messages })
    } else {
        res.status(400).json({ data: "Failed" })
    }

});

let port = 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});