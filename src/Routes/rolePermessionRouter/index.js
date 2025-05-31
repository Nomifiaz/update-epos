import express from "express";
import{addRoles,deleteRole,getAllRoles, updateRole} from "../../controllers/RoleContoller/addRole.js"
import{addTask,getAllTasks} from "../../controllers/RoleContoller/task.js"
import { assignPermission, deletePermission, getAllRolesWithTasks, updatePermission } from "../../controllers/RoleContoller/permissions.js";
import {authenticateToken} from "../../middleware/authenticate.js"
const router = express.Router();


router.post("/createRole",addRoles );
 router.get("/all", getAllRoles);
router.put("/updateRole/:id",updateRole);
router.delete("/deleteRole/:id",deleteRole);
//add task
 router.post("/taskCreate",addTask);
 router.get("/task",getAllTasks);
//permisons 
router.post("/addPermission",assignPermission)
router.put("/updatePermission/:id",updatePermission)
router.delete("/deletePermission/:id",deletePermission)
// route.js
router.get('/rolesAndTask', getAllRolesWithTasks);


export default router;