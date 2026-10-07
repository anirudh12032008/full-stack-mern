const clean = (obj) => {
  if (Array.isArray(obj)) return obj.map(clean);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      out[key] = clean(value);
    }
    return out;
  }
  return obj;
};

export const sanitizeBody = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  next();
};
