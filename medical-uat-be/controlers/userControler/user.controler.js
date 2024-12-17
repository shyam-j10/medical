const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../dbConfig/config');
const { getUserByEmail } = require('../../utils/getUserByEmail/getUserByEmail');
const RegisterMedicalUser = async (req, res) => {
    try{
        const {name, email, password, role} = req.body
        const existingUser = await getUserByEmail(email);
        console.log(existingUser,"..... existing")
        if (existingUser) {
          return res.status(200).json({msg : 'Email already exists', code : 400});
        }
       
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, password, role]);
        const newUser = result.rows[0];    
        console.log(newUser) 
         const accessToken = jwt.sign({ userId: newUser.id, role: newUser.role }, process.env.JWT_SECRET_ASSESSTOKEN, { expiresIn: '1m' });
        const refreshToken = jwt.sign({ userId: newUser.id, role: newUser.role }, process.env.JWT_SECRET_REFRESHTOKEN, { expiresIn: '15d' });
        console.log(refreshToken,"/////// refresh token")
        const refreshtoken =  await pool.query(
            'UPDATE users SET refreshToken = $1 WHERE id = $2',
            [refreshToken, newUser.id]
          );
        // console.log(refreshtoken,"////////// token")
        return res.status(200).json({msg : "Registration Success", code : 200, data :{ ...newUser , accessToken}}); // Return user data along with the token
      
    }catch(error){
        console.log(error)
        return res.status(200).json({msg : "Internal Server Error!", code : 500})
    }
}


module.exports = {RegisterMedicalUser}