import multer from "multer";


const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits:{
         fileSize: 10 * 1024 * 1024, // 10 MB
    },

    fileFilter:(req:Express.Request, file:Express.Multer.File, callback:multer.FileFilterCallback)=>{

            console.log("========== FILE INFO ==========");
    console.log("Original Name:", file.originalname);
    console.log("MIME Type:", file.mimetype);
    console.log("Field Name:", file.fieldname);
    console.log("Size:", file.size);
    console.log("===============================");
        const types = ["image/jpeg", "image/png","image/webp", "application/octet-stream"];
        if(
            types.includes(file.mimetype)
        ){
            callback(null, true)
        }else{
            callback(new Error("Only JPEG, PNG and WEBP images are allowed"));
        }
    }

})

export default upload;