import {Request, Response, NextFunction} from 'express';
import { Server } from 'socket.io';
export type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<any> | any;

export interface CustomRequest extends Request {
    io: Server;
    user: any;
  }

export type ClientColsDbColsMap<T extends Record<string, string>> = T;

