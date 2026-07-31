import express from "express";

const app = express();

app.use(express.json());


app.get('/', (req, res)=>{
    res.send('School management Backend API')
})


export default app;