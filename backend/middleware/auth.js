const supabase = require('../utils/supabase');

// Middleware to verify Supabase JWT tokens
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No authorization token provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed' 
    });
  }
};

// Middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    // Get admin emails from environment variable or use defaults
    const adminEmailsEnv = process.env.ADMIN_EMAILS || 'jasonwilliamgolden@gmail.com,jgolden@bowerycreativeagency.com';
    const adminEmails = adminEmailsEnv.split(',').map(email => email.trim());

    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({ 
        error: 'Admin access required' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ 
      error: 'Authorization failed' 
    });
  }
};

// Optional auth - continues even if no token, but adds user if available
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without auth
    next();
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  optionalAuth
};