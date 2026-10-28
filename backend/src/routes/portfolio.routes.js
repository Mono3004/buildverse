const router = require("express").Router();
const {
  getMyPortfolio,
  getPortfolioBySlugOrId,
  savePortfolio,
} = require("../controllers/portfolio.controller");

router.get("/", getMyPortfolio);
router.get("/:slugOrId", getPortfolioBySlugOrId);
router.put("/", savePortfolio);

module.exports = router;
