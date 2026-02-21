import express from "express";
import { creatPlace } from "../controllers/place.controller.js";
import {protect} from "../middlewares/auth.mddleware.js"
import { uploadPlaceImagesMiddleware } from "../middlewares/uploadPlaceImages.middleware.js";


const router = express.Router();

router.post(
    "/create",
    protect,
    uploadPlaceImagesMiddleware,
    creatPlace,
);


export default router;