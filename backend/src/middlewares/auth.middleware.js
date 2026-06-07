const jwt = require('jsonwebtoken');

// Now I am checking whether the user is logged in or not
const verifyJWT = (req,res,next) => {
    try{

        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({ message: "Access Denied, no token provided, please log in." });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decodedToken;

        next();

    }
    catch(err) {
        return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
    }
};

// Now I am if you have the right role or not
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({ 
                message: `Role (${req.user.role}) is not allowed to access this resource.` 
            });
        }
        next();
    }
};

module.exports = {verifyJWT,authorizeRoles};