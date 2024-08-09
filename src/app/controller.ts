import { NextFunction, Request, Response } from "express";
import { Services } from "./service";


async function single(req: Request, res: Response, next: NextFunction) {

    try {
        const result = await Services.single(next);

    } catch (error) {
        next(error)
    }
}

export const Controllers = { single }