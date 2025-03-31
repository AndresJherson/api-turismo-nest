import { Usuario } from "@turismo/modelos";
import { Request, Response } from "express";
import { Transaction } from "sequelize";

export interface AuthenticationSessionData {
    req: Request;
    res: Response;
    transaction: Transaction;
    json: Record<string,any>;
}

export type AuthorizationSessionData = AuthenticationSessionData & {
    service: string,
    method: string,
    usuario: Usuario,
}