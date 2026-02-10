import express from 'express'

import {JWT_SECRET,bcrypt} from '@repo/backend-common/config';

import {signInSchema,signUpSchema,webSocketSchema} from '@repo/common/zod'

import {User} from '@repo/db/db'

import {prisma} from '@repo/db-prisma/prisma'

const app = express()

app.post('/signin',async (req,res)=>{
    const parsedContent = signUpSchema.safeParse(req.body)

    if (!parsedContent.success) {
        return res.status(411).json({message:'Invalid data',error:parsedContent.error})
    }

    const {email,password,name} = req.body 
    let user = await prisma.user.create({data:{email,password,name}})
    
    
})


app.listen(3001)