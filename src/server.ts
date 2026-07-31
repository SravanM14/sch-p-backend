import dotenv from "dotenv";
import app from './app';
import connectDataBase from "./config/database";


const Port = process.env.PORT || 5000;

const startServer = async():Promise<void> =>{
 try{
    await connectDataBase();
    app.listen(Port, ()=>{
           console.log(`🚀 Server running on http://localhost:${Port}`);
    })
 }
 catch(error){
     console.error("Failed to start server", error);
 }
}

startServer();