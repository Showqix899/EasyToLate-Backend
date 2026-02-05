import multer from "multer";

//store file in memory (fast,no tmepfile)
const storage = multer.memoryStorage();


//allow only images 
const fileFilter =(req,file,cb)=>{
    if (file.mimetype.startsWith("image/")){
        cb(null,true);
    }else{
        cb(new Error("only image files allowed"),false);
    }
};


//configure multer 
const upload = multer ({
    storage,
    fileFilter,
    limits:{fileSize:2*1024*1024}//2 MB limit
});

export default upload;