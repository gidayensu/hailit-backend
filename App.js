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
});


let ioUniqueNameSpace; 
let uniqueNspUser ='';
io.engine.use((req, res, next) => {
  const queryId = req._query.user_id;
  uniqueNspUser = queryId;
  const nsp = io.of(`/user-${queryId}`);
  ioUniqueNameSpace = nsp;
  nsp.use((socket, next) => {
    const user_id = socket.handshake.query.user_id;

    if (!user_id) {
      nsp.disconnectSockets(true);
      return next(new Error("Authentication error"));
    }
    socket.user_id = user_id;
    
    nsp.emit("hi", "everyone!");
    next();
  });
  
  nsp.on("connection", (socket) => {
    console.log(`User ${socket.user_id} connected to namespace ${nsp.name}`);

    socket.on("disconnect", () => {
      console.log(
        `User ${socket.user_id} disconnected from namespace ${nsp.name}`
      );
    });
  });
  
  
  
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
  
  req.io = ioUniqueNameSpace;
  req.nspUser = uniqueNspUser;
  ioUniqueNameSpace.emit('hi', "I am running")
  next()
})

io.on('connection', (socket) => {  
    
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
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

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
