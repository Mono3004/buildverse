const Course = require("../models/course.model");

module.exports = {
  findAll: (filter = {}) => Course.find(filter).sort({ createdAt: -1 }).lean(),
  findBySlug: (slug) => Course.findOne({ slug }).lean(),
  create: (payload) => Course.create(payload),
  updateBySlug: (slug, payload) => Course.findOneAndUpdate({ slug }, payload, { new: true }).lean(),
  deleteBySlug: (slug) => Course.findOneAndDelete({ slug }).lean(),
  deleteById: (id) => Course.findByIdAndDelete(id).lean(),
};