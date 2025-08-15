import { Request, Response } from "express";
import mongoose from "mongoose";
import TimeEntry from "../models/Timer";
import Project from "../models/Project";
import Task from "../models/Task";
import { AuthRequest } from "../middleware/authMiddleware";

// ------------------ 1. Project Totals ------------------
export const getProjectTotals = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  try {
    const totals = await TimeEntry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$projectId", totalDuration: { $sum: { $ifNull: ["$duration", 0] } } } },
      {
        $lookup: {
          from: "projects", // collection name
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" }, // remove empty projects
      {
        $project: {
          projectId: "$_id",
          projectName: "$project.name",
          totalDuration: 1,
        },
      },
      { $sort: { projectName: 1 } },
    ]);

    res.json(totals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch project totals" });
  }
};

// ------------------ 2. Task Totals ------------------
export const getTaskTotals = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.query;
  const userId = req.userId;

  try {
    const match: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId as string);

    const totals = await TimeEntry.aggregate([
      { $match: match },
      { $group: { _id: "$taskId", totalDuration: { $sum: { $ifNull: ["$duration", 0] } } } },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "_id",
          as: "task",
        },
      },
      { $unwind: "$task" },
      {
        $project: {
          taskId: "$_id",
          taskName: "$task.name",
          totalDuration: 1,
        },
      },
      { $sort: { taskName: 1 } },
    ]);

    res.json(totals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch task totals" });
  }
};

// ------------------ 3. Recent Entries ------------------
export const getRecentEntries = async (req: AuthRequest, res: Response) => {
  const { projectId, limit = 10, date } = req.query;
  const userId = req.userId;

  try {
    const match: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId as string);

    if (date) {
      const dayStart = new Date(date as string);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      match.startTime = { $gte: dayStart, $lte: dayEnd };
    }

    const entries = await TimeEntry.find(match)
      .sort({ startTime: -1 })
      .limit(Number(limit))
      .populate("projectId", "name _id")
      .populate("taskId", "name _id");

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recent entries" });
  }
};

// ------------------ 4. Summary (Today + Week) ------------------
export const getSummary = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);

    const [todayTotal, weekTotal] = await Promise.all([
      TimeEntry.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), startTime: { $gte: today } } },
        { $group: { _id: null, totalDuration: { $sum: { $ifNull: ["$duration", 0] } } } },
      ]),
      TimeEntry.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), startTime: { $gte: weekStart } } },
        { $group: { _id: null, totalDuration: { $sum: { $ifNull: ["$duration", 0] } } } },
      ]),
    ]);

    res.json({
      today: todayTotal[0]?.totalDuration || 0,
      week: weekTotal[0]?.totalDuration || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
};

// ------------------ 5. Weekly View ------------------
export const getWeeklyView = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const entries = await TimeEntry.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          startTime: { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $project: {
          day: { $dayOfWeek: "$startTime" }, // 1=Sunday
          projectId: 1,
          taskId: 1,
          duration: 1,
        },
      },
      { $lookup: { from: "projects", localField: "projectId", foreignField: "_id", as: "project" } },
      { $lookup: { from: "tasks", localField: "taskId", foreignField: "_id", as: "task" } },
      {
        $group: {
          _id: "$day",
          entries: {
            $push: {
              project: { $arrayElemAt: ["$project.name", 0] },
              task: { $arrayElemAt: ["$task.name", 0] },
              duration: "$duration",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch weekly view" });
  }
};
