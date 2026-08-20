import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tcgRouter from "./tcg";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tcg", tcgRouter);

export default router;
