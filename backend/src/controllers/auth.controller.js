const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try{
        const {username,email,password,role} = req.body;

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(409).json({ message: "User already exists with this email" })
        }

        const hashedPassword = await bcrypt.hash(password,10);
        
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        });

        const token = jwt.sign({
            id: newUser._id,
            role: newUser.role
        },process.env.JWT_SECRET,{expiresIn: "7d"});

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        res.status(201).cookie("token", token, cookieOptions).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role
            }
        });
    }
    catch (err) {
        console.error("Error in registerUser: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    } 
}

const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({
            id : user._id, 
            role: user.role  
        },process.env.JWT_SECRET,{expiresIn: "7d"});

        const cookieOptions = {
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        res.status(200).cookie("token", token, cookieOptions).json({
            message: "Logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        })

    }
    catch (err) {
        console.error("Error in loginUser: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const logoutUser = async (req, res) => {
    try{
        const cookieOptions = {
            httpOnly: true,
            secure: true, 
            sameSite: 'none'
        };

        res.status(200).clearCookie("token", cookieOptions).json({
            message: "User logged out successfully"
        });
    }
    catch(err) {
        console.error("Error in logoutUser: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {registerUser, loginUser, logoutUser};