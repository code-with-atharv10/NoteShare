import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import notesRouter from "./notes";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(notesRouter);
router.use(usersRouter);

export default router;
