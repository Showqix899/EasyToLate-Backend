import express from "express";
import { createPlace } from "../controllers/place.controller.js";
import {protect,adminAccess} from "../middlewares/auth.mddleware.js";
import {uploadPlaceImagesMiddleware} from "../middlewares/uploadMultipleImages.middleware.js";



const router = express.Router();

//create place 
router.post("/create",protect,uploadPlaceImagesMiddleware,createPlace)


export default router;