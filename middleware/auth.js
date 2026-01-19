const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const parts = authHeader.split(' ');
  if (parts.length !==2) return res.status(401).json({ message: 'Token error' });
  const token = parts[1];
  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = { id: decoded.id, role: decoded.role };
    next();
  });
};
