export default function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Duplicate entry',
          message: `A record with this ${err.meta?.target?.[0] || 'value'} already exists`
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Not found',
          message: 'The requested record does not exist'
        });
      case 'P2003':
        return res.status(400).json({
          error: 'Foreign key error',
          message: 'Referenced record does not exist'
        });
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
