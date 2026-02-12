import multer from 'multer';

//store files in memory (buffer)

//store files in memory (buffer)
const storage = multer.memoryStorage();


//file filter (only images)
const fileFilter = (req,file,cb)=>{

    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png"  ||
        file.mimetype === "image/jpg"  ||
        file.mimetype === "image/webp"
    ){
        cb(null,true);
    }else{
        cb(new Error("only image files are allowed"))
    }
};


//upload middleware 
export const uploadPlaceImagesMiddleware = multer({
    storage,
    fileFilter,
    limits:{
        files:20,
        fileSize:5 * 1024 *1024
    }
}).array("images",20);