import {Schema,model} from 'mongoose'

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    }
})

export const User = model("User",userSchema)