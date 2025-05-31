import Task from "../../models/task.js";
 export const addTask = async (req, res) => {
  try {
    const { code } = req.body;
    const task = await Task.create({ code });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to add task" });
  }
}
//fatch all roles
 export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.status(200).json({message:"success",tasks});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}
