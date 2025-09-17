export function requireRoles(...roles) {
  return (req, res, next) => {
    const r = req.user?.role;
    if (!r) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(r)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
