import { Request, Response } from "express";
import { recommendationService } from "../services/recommendationsService.js";

export async function resetDataBase(req: Request, res: Response) {
  await recommendationService.resetDataBase();
  res.sendStatus(204);
}
