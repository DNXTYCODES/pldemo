import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  let token = req.headers.token || req.headers.authorization;

  // Remove "Bearer " prefix if present
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  if (!token) {
    return res.json({
      success: false,
      message: "Not Authorized. Please Login or Create an Account",
    });
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;

// import jwt from 'jsonwebtoken';

// const auth = (req, res, next) => {
//   try {
//     const token = req.headers.token;
//     if (!token) {
//       return res.status(401).json({ success: false, message: "Authorization token missing" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = { id: decoded.id };
//     next();
//   } catch (error) {
//     console.error(error);
//     res.status(401).json({ success: false, message: "Invalid token" });
//   }
// };

// export default auth;
