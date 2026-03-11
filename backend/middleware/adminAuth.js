import jwt from 'jsonwebtoken'

const adminAuth = async (req,res,next) => {
    try {
        let token = req.headers.token || req.headers.authorization;
        
        // Remove "Bearer " prefix if present
        if (token && token.startsWith("Bearer ")) {
            token = token.slice(7);
        }
        
        if (!token) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        req.adminId = token_decode;
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth