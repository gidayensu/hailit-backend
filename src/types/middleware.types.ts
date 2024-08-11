import {Request, Response, NextFunction} from 'express';
export type Middleware = (req: Request, res: Response, next?: NextFunction) => Promise<any> | any;


export type ClientColsDbColsMap<T extends Record<string, string>> = T;

