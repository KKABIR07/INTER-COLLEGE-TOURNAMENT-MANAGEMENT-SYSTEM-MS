const jwt = require('jsonwebtoken');
const User = require('../models/userScema');

const authenticate = async (req, res, next) => {
    try {
        console.log('Cookies:', req.cookies); // Log cookies
        const token = req.cookies.jwtoken;

        console.log('Token from cookies:', token); // Log token

        if (!token) {
            return res.status(401).send('Unauthorized: No token provided');
        }

        if (!process.env.SECRET_KEY) {
            throw new Error('SECRET_KEY is not defined');
        }

        let verifyToken;
        try {
            verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        } catch (err) {
            return res.status(401).send('Unauthorized: Invalid token');
        }

        const rootUser = await User.findOne({ _id: verifyToken._id, 'tokens.token': token });

        if (!rootUser) {
            return res.status(404).send('User not found');
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();
    } catch (err) {
        res.status(401).send('Unauthorized');
        console.error(err);
    }
};

module.exports = authenticate;

