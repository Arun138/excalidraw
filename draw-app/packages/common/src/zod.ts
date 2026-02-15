import {z} from 'zod'

const signUpSchema = z.object({
    username:z.string().min(3),
    password:z.string().min(8),
    name:z.string().min(1)
})

const signInSchema = z.object({
    username:z.string().min(3),
    password:z.string().min(8)
})

const createRoomSchema = z.object({
    name:z.string().min(1)
})


export {signInSchema,signUpSchema,createRoomSchema}