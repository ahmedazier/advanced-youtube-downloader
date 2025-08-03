/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Log error details
  console.error('Error Stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request Method:', req.method);
  
  // Send appropriate error response
  if (req.xhr || req.path.startsWith('/api/')) {
    // API request - send JSON error
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  } else {
    // Page request - render error page
    res.status(500).render('error', {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
}

/**
 * 404 handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function notFoundHandler(req, res) {
  if (req.xhr || req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not Found' });
  } else {
    res.status(404).render('error', {
      error: 'Page Not Found',
      message: 'The page you are looking for does not exist.'
    });
  }
}

module.exports = {
  errorHandler,
  notFoundHandler
}; 