const fs = require("fs");
const app = require("express")();

option = {
	key: fs.readFileSync('./private.key'),
	cert: fs.readFileSync('./certificate.crt'),
	ca: fs.readFileSync('./ca_bundle.crt')
};

const server = require("http").createServer(app);
const cors = require("cors");
// const https = require('https');

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 8900;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
        console.log(`call ended`)
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
        console.log(`${from} to ${name} Called`);
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
        console.log(`${data.to} answered`)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
// https.createServer(option, app).listen(PORT, () => console.log(`Server is running on port ${PORT}`));
