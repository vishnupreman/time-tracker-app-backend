import Task, { ITask } from "../models/Task";
import {Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
// Get all tasks for logged-in user
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const tasks = await Task.find({ userId }).populate("projectId", "name");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Create task
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const { name, description, status, projectId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ message: "Name and Project are required" });
    }

    const task = await Task.create({
      name,
      description,
      status: status || "pending",
      projectId,
      userId,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Update task
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId
    const task = await Task.findOne({ _id: id, userId });

    if (!task) return res.status(404).json({ message: "Task not found" });

    Object.assign(task, req.body);
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Delete task
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId
    const task = await Task.findOneAndDelete({ _id: id, userId });

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
