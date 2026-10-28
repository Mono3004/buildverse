const router = require("express").Router();
const {
  getMentees,
  getReviews,
  createReview,
  updateReviewStatus,
  setReviewQuery,
  addReviewComment,
  rateReview,
  rateMentor,
} = require("../controllers/mentorship.controller");

router.route("/mentees").get(getMentees);
router.route("/reviews").get(getReviews).post(createReview);
router.route("/reviews/:id/status").patch(updateReviewStatus);
router.route("/reviews/:id/approve").post((req, res, next) => {
  req.body.status = "Approved";
  updateReviewStatus(req, res, next);
});
router.route("/reviews/:id/query").patch(setReviewQuery);
router.route("/reviews/:id/comments").post(addReviewComment);
router.route("/reviews/:id/rate").post(rateReview);
router.route("/rate-mentor").post(rateMentor);

module.exports = router;
