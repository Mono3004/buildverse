const router = require("express").Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  assignMentor,
} = require("../controllers/project.controller");

router.get("/", getProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/assign-mentor", assignMentor);

module.exports = router;
