import { Router } from "express";
import { resetDataBase } from "../controllers/testController.js";

const testRouter = Router();

testRouter.delete("/reset", resetDataBase);

export default testRouter;
