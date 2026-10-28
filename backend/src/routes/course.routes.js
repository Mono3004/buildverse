const router = require("express").Router();
const controller = require("../controllers/course.controller");
const validate = require("../middlewares/validate.middleware");
const { createCourse } = require("../validations/course.validation");

router.get("/", controller.list);
router.get("/:slug", controller.getBySlug);
router.post("/", validate(createCourse), controller.create);
router.delete("/:id", controller.delete);

module.exports = router;