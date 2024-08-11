import amqplib from 'amqplib';
const RABBITMQ_URL = 'amqp://yogendrarana:password@localhost';

export default async function connectRabbitMQ() {
    try {
        const rabbitMQConnection = await amqplib.connect(RABBITMQ_URL);
        const channel = await rabbitMQConnection.createChannel();

        if (channel) {
            console.log("Service B connected to RabbitMQ");
        }

        // Set up consumers after connection is established
        await setupSimpleQueueConsumer(channel);
        await setupWorkQueueConsumer(channel);
        await setupPubSubConsumer(channel);
        await setupDirectConsumer(channel);
        await setupTopicConsumer(channel)

        return channel;
    } catch (err) {
        console.log("Error conncting Service B to RabbitMQ: ", err.message);
    }
}


// set up simple queue consumer
async function setupSimpleQueueConsumer(channel) {
    const queue = 'simple_queue';
    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, (msg) => {
        if (msg !== null) {
            console.log('Received from simple queue:', msg.content.toString());
            channel.ack(msg);
        }
    });
}

// set up work queue consumer
async function setupWorkQueueConsumer(channel) {
    const queue = 'work_queue';
    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);
    channel.consume(queue, (msg) => {
        if (msg !== null) {
            const secs = msg.content.toString().split('.').length - 1;
            console.log('Received task:', msg.content.toString());
            setTimeout(() => {
                console.log('Task done');
                channel.ack(msg);
            }, secs * 1000);
        }
    });
}

// set up pub/sub consumer
async function setupPubSubConsumer(channel) {
    const exchange = 'logs';
    await channel.assertExchange(exchange, 'fanout', { durable: false });
    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, exchange, '');
    channel.consume(queue, (msg) => {
        if (msg !== null) {
            console.log('Received broadcast:', msg.content.toString());
        }
    }, { noAck: true });
}

// set up direct consumer
async function setupDirectConsumer(channel) {
    const exchange = 'direct_logs';
    await channel.assertExchange(exchange, 'direct', { durable: false });
    const { queue } = await channel.assertQueue('', { exclusive: true });
    const severities = ['info', 'warning', 'error'];
    for (const severity of severities) {
        await channel.bindQueue(queue, exchange, severity);
    }
    channel.consume(queue, (msg) => {
        if (msg !== null) {
            console.log(`Received ${msg.fields.routingKey}: ${msg.content.toString()}`);
        }
    }, { noAck: true });
}

// set up topic consumer
async function setupTopicConsumer(channel) {
    const exchange = 'topic_logs';
    await channel.assertExchange(exchange, 'topic', { durable: false });
    const { queue } = await channel.assertQueue('', { exclusive: true });
    const topics = ['#.error', 'kern.*', '*.critical'];
    for (const topic of topics) {
        await channel.bindQueue(queue, exchange, topic);
    }
    channel.consume(queue, (msg) => {
        if (msg !== null) {
            console.log(`Received ${msg.fields.routingKey}: ${msg.content.toString()}`);
        }
    }, { noAck: true });
}