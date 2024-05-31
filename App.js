import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors'

//routes
import {driverRouter} from './src/v1/routes/driver.routes.js';
import {userRouter} from './src/v1/routes/user.routes.js';
import {riderRouter} from './src/v1/routes/rider.routes.js';
import {tripRouter} from './src/v1/routes/trip.routes.js';
import { vehicleRouter } from './src/v1/routes/vehicle.routes.js';

const PORT = process.env['PORT']||5000;
const SESSION_SECRET = process.env['SESSION_SECRET']

const app = new express();

app.use(cors())
app.use(helmet());
app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
// app.use(session({
//     secret: SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))

const v1Routes = [
  { path: '/api/v1/drivers', route: driverRouter },
  { path: '/api/v1/users', route: userRouter },
  { path: '/api/v1/riders', route: riderRouter },
  { path: '/api/v1/trips', route: tripRouter },
  { path: '/api/v1/vehicles', route: vehicleRouter }
  ];
  
  for (const v1Route of v1Routes) {
    app.use(v1Route.path, v1Route.route);
  }
  

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`)
})