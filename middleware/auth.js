const config = require('config')
const jwt = require ('jsonwebtoken')


module.exports = function(req, res, next) {
    //Get the token from header
    const token = req.headers

    if(!token.authorization){
        return res.status(401).json({msg : "No token, authorization denied"})
    }

    //Verify token 
    try {
        const decoded = jwt.verify(token.authorization, config.get('jwtSecret'));
        req.user = decoded.user;
        next()
    } catch (error) {
        res.status(401).json({msg: 'Token is not valid'})
    }
}