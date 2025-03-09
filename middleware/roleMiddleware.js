const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        console.log("Request : ", req)
        // Ensure req.user exists (set by authentication middleware)
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        next(); // User has the correct role, proceed to the next middleware
    };
};

module.exports = roleMiddleware;
