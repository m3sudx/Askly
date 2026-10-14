import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import aipRouters from './routes/index.js'
import notFound from './middleware/not-found.js'
import errorHandler from './middleware/errorHandler.js'

const app=express()
app.use(cors())
app.use(express.json())

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

