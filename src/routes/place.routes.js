import express from "express";
import { creatPlace,searchPlaces,getPlace,updatePlace} from "../controllers/place.controller.js";
import {protect,adminAccess} from "../middlewares/auth.mddleware.js"
import { uploadPlaceImagesMiddleware } from "../middlewares/uploadPlaceImages.middleware.js";


const router = express.Router();

//create place route
router.post(
    "/create",
    protect,
    uploadPlaceImagesMiddleware,
    creatPlace,
);

//get all the place route
router.get("/all",searchPlaces);

//get a place route 
router.get("/get/:place_id",protect,getPlace);

//update place 
router.put("/update/:id",protect,uploadPlaceImagesMiddleware,updatePlace);





export default router;