import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const pictureSchema = new Schema(
    {
        type: {
            type: String, // Correctly define the type
            required: true, // Ensure it is required
        },
    },
    { _id: true } // Keep individual IDs for pictures
);

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true, 
            index: true
        },
        age:{
            type: Number
        },
        avatar: {
            type: String, 
        },
        pictures: {
            type: [pictureSchema]
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        },
        friends: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            username: {
                type: String,
                required: true
            },
        }],
        friendRequests: {
            sent: [{
                recipient: {
                    userId: {
                        type: Schema.Types.ObjectId,
                        ref: 'User',
                        required: true
                    },
                    username: {
                        type: String,
                        required: true
                    }
                },
                status: {
                    type: String,
                    enum: ['pending', 'accepted', 'rejected'],
                    default: 'pending'
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }],
            received: [{
                requester: {
                    userId: {
                        type: Schema.Types.ObjectId,
                        ref: 'User',
                        required: true
                    },
                    username: {
                        type: String,
                        required: true
                    }
                },
                status: {
                    type: String,
                    enum: ['pending', 'accepted', 'rejected'],
                    default: 'pending'
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }]
        }

    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema)

export default User