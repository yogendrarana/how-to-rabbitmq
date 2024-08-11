import express from "express";
import connectRabbitMQ from "./config/rabbit-mq.js";

export default function createApp() {
    // express app
    const app = express();

    // middleware
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // rabbit mq
    const channel = connectRabbitMQ();

    // routes
    app.get('/', (req, res) => res.send('Welcome to Server B!'))


    // return app
    return app;
}