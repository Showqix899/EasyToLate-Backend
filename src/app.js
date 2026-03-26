import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import session from "express-session"

import authRoutes from "./routes/auth.routes.js"
import placeRoutes from "./routes/place.routes.js"
import bookingRoutes from "./routes/booking.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"
import behaviourTrackerRoutes from "./routes/behaviourTracking.routes.js"

const app = express(); //express app

app.use(cors())
app.use(express.json()) //json parser
app.use(express.urlencoded({ extended: true }))

app.use(
    session({
        secret:"sslcommerz_secret",
        resave:false,
        saveUninitialized:true,
    })
)



// Swagger UI route
// Swagger route MUST be before other routes
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//main routes *********************
//auth routes 
app.use("/api/auth",authRoutes)
app.use("/api/places",placeRoutes)
app.use("/api/payment",bookingRoutes)
app.use("/api/subscription",subscriptionRoutes)
app.use("/api/behaviour-track",behaviourTrackerRoutes)

//******************************** */

export default app;