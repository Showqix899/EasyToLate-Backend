import express from "express"
import { getRecomendedPlace } from "../controllers/recomendation.controller.js"
import {getAiRecomendations} from "../controllers/aiRecomendation.controller.js"
import { protect } from "../middlewares/auth.mddleware.js"

const router = express.Router()

router.get("/recommended",protect,getRecomendedPlace)
router.get("/ai/recomendation",protect,getAiRecomendations)

export default router