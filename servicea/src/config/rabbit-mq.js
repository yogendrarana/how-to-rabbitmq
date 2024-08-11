import amqplib from 'amqplib';
const RABBITMQ_URL = 'amqp://yogendrarana:password@localhost';

async function connectRabbitMQ() {
    try {
        const rabbitMQConnection = await amqplib.connect(RABBITMQ_URL);
        const channel = await rabbitMQConnection.createChannel();

        if (channel) {
            console.log("Service A connected to RabbitMQ");
        }

        return channel;
    } catch (err) {
        console.log("Error conncting Service A to RabbitMQ: ", err.message);
    }
}

export default connectRabbitMQ;