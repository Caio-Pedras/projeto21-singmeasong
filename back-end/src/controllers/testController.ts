import { Request, Response } from "express";
import * as resetDatabaseService from "../services/resetDatabaseService.js";

export async function resetDataBase(req: Request, res: Response) {
  await resetDatabaseService.resetDataBase();
  res.sendStatus(204);
}
