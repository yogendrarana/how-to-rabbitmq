import createApp from "./app.js";
import { createServer } from "node:http"

const app = createApp();
const server = createServer(app);

// server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server A listening on port ${PORT}`)
})