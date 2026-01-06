/**
 * Centralized API Response Handler
 * Ensures consistent response format across all endpoints
 */

class ResponseHandler {
  /**
   * Send success response
   */
  static success(res, statusCode, message, data = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send error response
   */
  static error(res, statusCode, message, error = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (error && process.env.NODE_ENV === "development") {
      response.error = error.message || error;
      response.stack = error.stack;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send paginated response
   */
  static paginated(res, statusCode, message, data, page, limit, total) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ResponseHandler;
