const service = require("../services/course.service");
const asyncHandler = require("../utils/asyncHandler");

exports.list = asyncHandler(async (_req, res) => {
  const data = await service.list();
  res.json({ success: true, count: Array.isArray(data) ? data.length : 0, data });
});

exports.getBySlug = asyncHandler(async (req, res) => {
  res.json({ data: await service.getBySlug(req.params.slug) });
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await service.create(req.body) });
});

exports.delete = asyncHandler(async (req, res) => {
  await service.delete(req.params.id);
  res.json({ success: true, message: "Course deleted successfully" });
});