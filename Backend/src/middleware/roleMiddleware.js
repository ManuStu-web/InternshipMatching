const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {

        // Check whether authentication middleware
        // has added a user to the request
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Check whether user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // User is authenticated and has the correct role
        next();
    };
};

module.exports = roleMiddleware;