const { errorResponse } = require('../utils/apiResponse');

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return errorResponse(res, 403, 'Access denied. Insufficient permissions.');
        }
        next();
    };
};

module.exports = { requireRole };
