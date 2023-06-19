const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

module.exports = (authRole="ALL")=>{
    return (req,res,next)=>{
        const token= req.headers?.authorization?.split(" ")[1]
        if (token) {
            try {
                const {id,role , company_id}=jwt.verify(token,'alsham2332')
                if (id) {
                    req.loginData={id , role , company_id}
                    if (authRole == "ALL") {
                        next()     
                    } else {
                        role===2 ? next() : res.status(StatusCodes.UNAUTHORIZED).json({message:"Not Authenticated"})
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
/**
 * 
Please reach out to Netlify support team & ask them to add Google workspace MX records with Netlify your web host.

https://support.google.com/a/answer/174125?hl=en&sjid=14758401563552248255-AP#zippy=%2Ci-signed-up-in-or-later

Please understand I'm from Google domains & can help you with editing DNS at https://domains.google.com/registrar/trendvisit.com/dns/ at this page.
 */