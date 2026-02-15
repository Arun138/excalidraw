import mongoose,{Schema,model} from 'mongoose'

mongoose.connect("mongodb://localhost:27017/excalidraw")

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    photo:{
        type:String,
        default:null
    }
})

const roomSchema = new Schema({
    slug:{
        type:String,
        unique:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    admin:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },

})

const chatSchema = new Schema({
    message:String,
    room:{
        type:Schema.Types.ObjectId,
        ref:"Room"
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})

export const User = model("User",userSchema)
export const Room = model("Room",roomSchema)
export const Chat = model("Chat",chatSchema)

export {mongoose}