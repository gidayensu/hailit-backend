import express from 'express';
import morgan from 'morgan';
// import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
// routes
import { driverRouter } from './src/v1/routes/driver.routes';
import { userRouter } from './src/v1/routes/user.routes';
import { riderRouter } from './src/v1/routes/rider.routes';
import { tripRouter } from './src/v1/routes/trip.routes';
import { vehicleRouter } from './src/v1/routes/vehicle.routes';

//types
import {Request, Response, NextFunction} from 'express';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(morgan('tiny')); 
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);
const io: Server = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  }
});



io.engine.use((req: Request, res:Response , next: NextFunction) => {
  const user_id = req._query.user_id;
  if (!user_id) {
    io.disconnectSockets(true);
    return next(new Error("Authentication error"));
  }
  next();
});

io.use((socket, next) => {
  const userId = socket.handshake.query.user_id; 
  
  if (!userId) {
    return next(new Error('Authentication error'));
  }
  (socket as any).userId = userId;
  next();
});


app.use((req: Request, res: Response, next: NextFunction)=> {
  
  req.io = io;
  next()
})

io.on('connection', (socket) => {  
  const userId = (socket as any).userId;

  console.log(`User ${userId} connected`);
  socket.join(userId);
  
  socket.on("disconnect", () => {
    console.log(
      `User ${userId} disconnected from room `
    );
  });
});

io.of("/admins").use((socket, next) => {
  const userId = socket.handshake.query.user_id; 
  
  if (!userId) {
    return next(new Error('Authentication error. Not an Admin'));
  }
  (socket as any).adminUserId = userId;
  next();
});

io.of("/admins").on("connection", (socket)=> {
  const userId = (socket as any).adminUserId;
  
  
  console.log(`Admin ${userId} connected`)
  
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
