import {Response } from "express";
import TimeEntry from "../models/Timer"
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";

export const startTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, taskId } = req.body;
    const userId = req.userId;

    
    const activeTimer = await TimeEntry.findOne({ userId, isRunning: true });
    if (activeTimer) return res.status(400).json({ message: "Stop the current timer first" });

    const timer = new TimeEntry({
      userId,
      projectId,
      taskId,
      startTime: new Date(),
      isRunning: true,
    });
    await timer.save();

    res.status(201).json(timer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const stopTimer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const timer = await TimeEntry.findOne({ userId, isRunning: true });
    if (!timer) return res.status(400).json({ message: "No running timer found" });

    timer.endTime = new Date();
    timer.duration = Math.floor((timer.endTime.getTime() - timer.startTime.getTime()) / 60000); // in minutes
    timer.isRunning = false;
    await timer.save();

    res.status(200).json(timer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add Manual Entry
export const addManualEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, taskId, startTime, endTime } = req.body;
    const userId = req.userId;
    console.log(projectId,taskId,startTime,'aaaaaaaaaa')
    const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);

    const entry = new TimeEntry({
      userId,
      projectId,
      taskId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      isRunning: false,
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit Entry
export const editEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { projectId, taskId, startTime, endTime } = req.body;

    const entry = await TimeEntry.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    if (projectId) entry.projectId = projectId;
    if (taskId) entry.taskId = taskId;
    if (startTime) entry.startTime = new Date(startTime);
    if (endTime) entry.endTime = new Date(endTime);

    // Only calculate duration if both startTime and endTime are defined
    if (entry.startTime && entry.endTime) {
      entry.duration = Math.floor(
        (entry.endTime.getTime() - entry.startTime.getTime()) / 60000
      );
    }

    await entry.save();
    res.status(200).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Delete Entry
export const deleteEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await TimeEntry.findByIdAndDelete(id);
    res.status(200).json({ message: "Entry deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Entries (with optional filters)
export const getEntries = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { projectId, taskId, date } = req.query;

    const filter: any = { userId };
    if (projectId) filter.projectId = projectId;
    if (taskId) filter.taskId = taskId;
    if (date) {
      const start = new Date(date as string);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.startTime = { $gte: start, $lt: end };
    }

    const entries = await TimeEntry.find(filter)
      .populate("projectId", "name")
      .populate("taskId", "name")
      .sort({ startTime: -1 });

    res.status(200).json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};