exports.admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super-admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Admin privileges required' });
  }
};
