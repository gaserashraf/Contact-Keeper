const jwt = require("jsonwebtoken");
const config = require('config');
module.exports = function(req,res,next){

    // get the token form header
    const token = req.header('x-auth-token');

    if(!token)
        return res.status(401).json({msg:"no token authorization denied"});
    try {
        const decoded = jwt.verify(token , config.get('jwt'));
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).json({msg:"invaild token authorization denied"});
    }

}