import express from "express";
import { 
  getProjectTotals,
  getTaskTotals,
  getRecentEntries,
  getSummary,
  getWeeklyView
} from "../controllers/dashboardController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/project-totals",authMiddleware, getProjectTotals);
router.get("/task-totals",authMiddleware, getTaskTotals);
router.get("/recent-entries",authMiddleware, getRecentEntries);
router.get("/summary",authMiddleware, getSummary);
router.get("/weekly-view",authMiddleware, getWeeklyView);

export default router;
