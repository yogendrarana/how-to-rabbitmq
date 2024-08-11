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
    app.get('/', (req, res) => res.send('Welcome to Server A!'))

    // simple queue
    app.post('/simple-queue', async (req, res) => {
        const queue = 'simple_queue';
        const msg = req.body.message || 'Hello from simple queue';

        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });

        res.send('Message sent to simple queue');
    })

    // Work Queue
    app.post('/work-queue', async (req, res) => {
        const queue = 'work_queue';
        const msg = req.body.message || 'Task ' + Math.random();

        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });

        res.send('Task sent to work queue');
    });

    // Publish/Subscribe
    app.post('/publish', async (req, res) => {
        const exchange = 'logs';
        const msg = req.body.message || 'Info: Hello World!';

        await channel.assertExchange(exchange, 'fanout', { durable: false });
        channel.publish(exchange, '', Buffer.from(msg));

        res.send('Message published');
    });

    // Routing
    app.post('/direct', async (req, res) => {
        const exchange = 'direct_logs';
        const { severity, message } = req.body;

        await channel.assertExchange(exchange, 'direct', { durable: false });
        channel.publish(exchange, severity, Buffer.from(message));

        res.send('Direct message sent');
    });

    // Topics
    app.post('/topic', async (req, res) => {
        const exchange = 'topic_logs';
        const { topic, message } = req.body;

        await channel.assertExchange(exchange, 'topic', { durable: false });
        channel.publish(exchange, topic, Buffer.from(message));

        res.send('Topic message sent');
    });

    // return app
    return app;
}