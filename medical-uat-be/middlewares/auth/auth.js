const pool = require("../../dbConfig/config");
const jwt = require("jsonwebtoken")
// Function to get user by refresh token
async function getUserByRefreshToken(userId) {
    try {
        await pool.connect();
        console.log("alksd caaaaaaaaa") 
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [userId]);
        console.log("after..........", result)
          
        if (result.rows.length > 0) {
            console.log("enter refresh function user.....",result.rows[0])
            const userData =  result.rows[0]; // Return user record
            const userRefreshToken = userData?.refreshtoken
            const decoded = jwt.verify(userRefreshToken, process.env.JWT_SECRET_REFRESHTOKEN);
            if(decoded.userId){
                console.log("enter decoded id..........")
                const createNewAccessToken = jwt.sign({ userId: userData.id , role: userData?.role}, process.env.JWT_SECRET_ASSESSTOKEN, { expiresIn: '1m' });
                console.log("new access token,,,,,,,,,,,", createNewAccessToken)
                
                return {accessToken : createNewAccessToken, sts : true}
            }
        }else{
           

return {sts : false, msg : "User Not Found"}
        }
    } catch (err ) {
        

        console.error('Error fetching user', err.stack);
       if( err.name === 'TokenExpiredError'){
        console.log("/enterrrrrr")
        return {sts : false, msg : "Session Expired Please Login Again",path : "/login"}
       }else{
        console.log("enter...... else refres catch block")
        return {sts : false, msg : "Session Expired Please Login Again",path : "/login"}

       }
    } 
}

const authMiddleware = async (req, res, next) => {
   console.log("enter auth ........................1111")
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];
    console.log(accessToken,".......... accesssssss")
    if (!accessToken) {
        return res.status(200).json({ msg: 'Access token required', code : 400 });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_ASSESSTOKEN);
        console.log(decoded,"//////// decoded")
        req.userId = decoded.userId
        return next(); 
    } catch (err) {
        console.log(err)
        console.log("enter auth catch.............")
        if (err.name === 'TokenExpiredError') {
            console.log("enter token expired................")
            try {
                // Validate the refresh token
                const decoded = jwt.decode(accessToken);
                console.log(decoded,".......... token decodedddddddd")
                const userId = decoded ? decoded.userId : null;
                console.log(userId,"//////// user id")
                const user = await getUserByRefreshToken(userId);
                console.log(user,",kjhgfhjkjhg///////// user")
                if (!user.sts) {
                    return res.status(200).json({ msg: user?.msg, code : 400 });
                }else{
                    console.log(".............. enrerer")
                    return res.status(200).json({token : user?.accessToken, code : 201})
                }
                
            } catch (error) {
                return res.status(200).json({ msg: 'Error refreshing token' , code : 400});
            }
        }
        console.log("enter, normal errior")
        return res.status(200).json({ msg: 'Access token expired and no valid refresh token', code : 500 });
    }
};

module.exports = {authMiddleware}