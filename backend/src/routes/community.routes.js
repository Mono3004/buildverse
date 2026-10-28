const router = require("express").Router();
const {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  deletePost,
} = require("../controllers/community.controller");

router.get("/", getPosts);
router.post("/", createPost);
router.post("/:id/like", toggleLike);
router.post("/:id/comments", addComment);
router.delete("/:id", deletePost);

module.exports = router;
