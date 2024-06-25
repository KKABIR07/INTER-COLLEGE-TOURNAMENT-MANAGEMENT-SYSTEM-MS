const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    repassword: {
        type: String,
        required: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});

// Hashing passwords before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            const hashedPassword = await bcrypt.hash(this.password, 12);
            const hashedRepassword = await bcrypt.hash(this.repassword, 12);
            this.password = hashedPassword;
            this.repassword = hashedRepassword;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Generating auth token
userSchema.methods.generateAuthToken = async function() {
    try {
        const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, {
            expiresIn: "1h" // Optional: Set token expiry
        });
        this.tokens = this.tokens.concat({ token });
        await this.save();
        return token;
    } catch (err) {
        console.log(err);
    }
};

// User model
const User = mongoose.model('User', userSchema);

// Player Schema
const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Player model
const Player = mongoose.model('Player', playerSchema);

module.exports = { User, Player };
