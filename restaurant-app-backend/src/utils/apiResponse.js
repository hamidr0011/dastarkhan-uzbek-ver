const successResponse = (res, statusCode, message, data = {}) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, statusCode, message, errors = []) => {
    const response = {
        success: false,
        message
    };

    if (errors.length > 0) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

export { successResponse, errorResponse };
