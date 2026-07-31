import mongoose from "mongoose";


/** DB connect setup */

 const connectDataBase = async ():Promise<void> =>{
  try{
  mongoose.connect(process.env.MONGOURI as string);
  console.log('DataBase connected Successfully')
  }
   catch(err){
    console.log(`DataBase connection Failed : ${err}` );
   }
   process.exit(1)
}

export default connectDataBase;