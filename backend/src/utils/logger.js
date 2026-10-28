const stamp = () => new Date().toISOString();

module.exports = {
  info: (...a) => console.log(`[info] ${stamp()}`, ...a),
  warn: (...a) => console.warn(`[warn] ${stamp()}`, ...a),
  error: (...a) => console.error(`[error] ${stamp()}`, ...a),
};