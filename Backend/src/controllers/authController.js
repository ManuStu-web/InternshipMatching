const Government = require("../models/Government");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerGovernment = async(req,res) => {
    try{
        const{
             name,
            email,
            password,
            department,
            role
        } = req.body;

        const exisitingGovernment = await Government.findOne({email});

        if(exisitingGovernment){
            return res.status(400).json({
                message: "Government user already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const government = await Government.create({
            name,
            email,
            password: hashedPassword,
            department,
            role
        });

        res.status(201).json({
            message: "Government user registered successfully",
            government: {
                id: government._id,
                name: government.name,
                email: government.email,
                department: government.department,
                role: government.role
            }
        });
    }catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};

const loginGovernment = async (req,res) => {
    try{
        const {
            email,
            password
        } = req.body;

        const government = await Government.findOne({email});

        if(!government){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPassword = await bcrypt.compare(password,government.password);

        if(!isPassword)
        {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: government._id,
                role: government.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            government: {
                id: government._id,
                name: government.name,
                email: government.email,
                department: government.department,
                role: government.role
            }
        });
    }catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

module.exports = {
    registerGovernment,
    loginGovernment
};

