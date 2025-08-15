import { Router } from "express";
import {
  startTimer,
  stopTimer,
  addManualEntry,
  editEntry,
  deleteEntry,
  getEntries,
} from "../controllers/timerController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/start",authMiddleware, startTimer);
router.post("/stop",authMiddleware, stopTimer);
router.post("/manual",authMiddleware, addManualEntry);
router.patch("/:id", authMiddleware,editEntry);
router.delete("/:id",authMiddleware, deleteEntry);
router.get("/",authMiddleware, getEntries);

export default router;
