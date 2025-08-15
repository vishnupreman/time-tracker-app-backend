import express from "express";
import { getTasks,createTask,deleteTask,updateTask } from "../controllers/taskController"; 
import { authMiddleware } from "../middleware/authMiddleware"; 

const router = express.Router();

router.get("/getTasks", authMiddleware, getTasks);
router.post("/createTask", authMiddleware, createTask);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

export default router;
