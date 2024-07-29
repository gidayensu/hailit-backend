import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
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
// app.use(helmet());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create HTTP server and Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Middleware to make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});
 
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

// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
