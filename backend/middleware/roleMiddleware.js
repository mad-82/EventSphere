function authorize(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated." });
    }

    // admin has access to everything
    if (req.user.role === "admin") return next();

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
}

module.exports = { authorize };