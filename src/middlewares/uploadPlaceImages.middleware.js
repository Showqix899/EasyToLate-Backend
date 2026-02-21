import multer from "multer";


//buffer storage
const storage = multer.memoryStorage();

//file filter
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/webp"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only image files allowed"), false);
    }
};

export const uploadPlaceImagesMiddleware = multer({
    storage,
    fileFilter,
    limits:{
        files:10,
        fileSize: 5* 1024 *1024,
    },
}).array("images",10)