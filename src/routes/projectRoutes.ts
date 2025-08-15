import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getProjects,createProject,deleteProject,updateProject } from "../controllers/projectController";

const router = Router();


router.get("/getProject",authMiddleware, getProjects);
router.post("/createProject",authMiddleware, createProject);
router.put("/:id", authMiddleware,updateProject);
router.delete("/:id", authMiddleware ,deleteProject);

export default router;
