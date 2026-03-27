import express from "express"
import { getRecomendedPlace } from "../controllers/recomendation.controller.js"
import { protect } from "../middlewares/auth.mddleware.js"

const router = express.Router()

router.get("/recommended",protect,getRecomendedPlace)

export default router