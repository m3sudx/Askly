import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import aipRouters from './routes/index.js'
import notFound from './middleware/not-found.js'
import errorHandler from './middleware/errorHandler.js'
import path from "node:path";

const app=express()
app.set("trust proxy", 1);
app.use(cors())
app.use(express.json())
app.use("/widget", express.static(path.resolve(process.cwd(), "../widget/public")));

const PORT=process.env.PORT||3001

app.get('/health',(req,res)=>{
    res.status(200).json({
        success:true,
        message:'Working...'
    })
})

app.use('/api', aipRouters)
app.use(notFound)
app.use(errorHandler)


app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})

