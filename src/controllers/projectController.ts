import { Response } from "express";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/authMiddleware";


export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId; 
    const projects = await Project.find({ userId });
    console.log(projects,'project frokm teh get')
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// CREATE project
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, description } = req.body;
    console.log(name,description,'name')
    const project = await Project.create({ name, description, userId });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// UPDATE project
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: id, userId },
      { name, description },
      { new: true }
    );
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// DELETE project
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    await Project.findOneAndDelete({ _id: id, userId });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
