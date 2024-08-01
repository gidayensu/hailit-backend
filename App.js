import express from 'express';
import morgan from 'morgan';
// import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

// routes
import { driverRouter } from './src/v1/routes/driver.routes.js';
import { userRouter } from './src/v1/routes/user.routes.js';
import { riderRouter } from './src/v1/routes/rider.routes.js';
import { tripRouter } from './src/v1/routes/trip.routes.js';
import { vehicleRouter } from './src/v1/routes/vehicle.routes.js';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(morgan('tiny')); 
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  }
});



io.engine.use((req, res, next) => {
  const user_id = req._query.user_id;
  if (!user_id) {
    io.disconnectSockets(true);
    return next(new Error("Authentication error"));
  }
  next();
});

io.use((socket, next) => {
  const user_id = socket.handshake.query.user_id; 
  
  if (!user_id) {
    return next(new Error('Authentication error'));
  }
  socket.user_id = user_id;
  next();
});


app.use((req, res, next)=> {
  
  req.io = io;
  next()
})

io.on('connection', (socket) => {  
  const userId = socket.user_id;

  console.log(`User ${userId} connected`);
  socket.join(userId);
  io.to(userId).emit("hi", `Hello you are connected to room ${userId}`)
  socket.on("disconnect", () => {
    console.log(
      `User ${socket.user_id} disconnected from room `
    );
  });
});

io.of("/admins").use((socket, next) => {
  const user_id = socket.handshake.query.user_id; 
  
  if (!user_id) {
    return next(new Error('Authentication error. Not an Admin'));
  }
  socket.admin_user_id = user_id;
  next();
});

io.of("/admins").on("connection", (socket)=> {
  const userId = socket.admin_user_id;
  
  io.to(userId).emit("hi", `Hello you are connected to room ${userId}`)
  console.log(`Admin ${userId} connected`)

  io.of("/admins").emit("hi", `Hello you are as admin to admin namespace with ID ${userId}`)
  socket.on("disconnect", ()=> {
    console.log(`Admin ${userId} disconnected`)
  })
})



const v1Routes = [
  { path: '/api/v1/drivers', route: driverRouter },
  { path: '/api/v1/users', route: userRouter },
  { path: '/api/v1/riders', route: riderRouter },
  { path: '/api/v1/trips', route: tripRouter },
  { path: '/api/v1/vehicles', route: vehicleRouter },
];

for (const v1Route of v1Routes) {
  app.use(v1Route.path, v1Route.route);
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
