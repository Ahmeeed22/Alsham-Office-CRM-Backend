const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

module.exports = (authRole="ALL")=>{
    return (req,res,next)=>{
        const token= req.headers?.authorization?.split(" ")[1]
        if (token) {
            try {
                const {id,role , company_id,name,email}=jwt.verify(token,'alsham2332') ;
                if (id) {
                    req.loginData={id , role , company_id,name,email}
                 
                    if (authRole == "ALL") {
                        next()     
                    } else {
                        role===2 || role===3 ? next() : res.status(StatusCodes.UNAUTHORIZED).json({message:"Not Authenticated"})
                    }
                } else {
                    res.status(StatusCodes.UNAUTHORIZED).json({message:"Not Authenticated"})
                }
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error}) 
            }
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({message:"Not Authenticated"}) 
        }
    }
}
