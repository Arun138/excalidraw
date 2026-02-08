import express from 'express'

import {JWT_SECRET} from '@repo/backend-common/config';

import {signInSchema,signUpSchema,webSocketSchema} from '@repo/common/zod'


const app = express()

app.post('/signin',async (req,res)=>{
    const parsedContent = signUpSchema.safeParse(req.body)

    if (!parsedContent.success) {
        return res.status(411).json({message:'Invalid data',error:parsedContent.error})
    }

    
})


app.listen(3001)