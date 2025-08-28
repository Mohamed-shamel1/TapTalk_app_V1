import express from "express";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import massageController from "./modules/massage/massage.controller.js";
import  connectDB  from './DB/connection.js'; // Assuming you have a database connection function
import { globalErrorHandler } from './utils/response.js'; // Assuming you have a global error handler
import * as dotenv from 'dotenv';
import path, { resolve } from 'path';
import { rateLimit } from 'express-rate-limit'
dotenv.config({}); // Load environment variables from .env file
import cors from 'cors'; // Importing CORS for handling cross-origin requests
import helmet from "helmet";
import { specs, swaggerUi } from './utils/swagger.js';


const bootstrap = async () => {
  const app = express();

  const port = process.env.PORT || 3000;
  app.use(express.json());

  //connect to cors
  app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(helmet()); // Using helmet for security headers
// app.use("/uploads", express.static(path.resolve('./src/uploads')));


//make a rate limit to avoid spaning
const limiter =rateLimit({
  windowMs: 60*60 * 1000, // 1 hour
  limit:2000, //for 5 request
  message :"Too many requests from this IP, please try again after an hour",
  standardHeaders: 'draft-8',
});


app.use("/api/auth",limiter); // Apply rate limit to auth routes

  // connectDB
 await connectDB();




  
  app.get ('/' , (req, res)=>{
    res.json("Welcome to the TapTalk APP");
  })

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TapTalk API Documentation'
  }));

  // Routes
  app.use("/api/auth", authController);
  app.use("/api/user", userController);
  app.use("/api/message", massageController);









  app.all('{/*dummy}', (req, res) => {
    res.status(404).json({ message: "Not Found" });
  });



  // Error handling middleware
  app.use(globalErrorHandler);


  app.listen(port, () =>
    console.log(
      `Example app listening on port ${port}! http://localhost:${port}`
    )
  );
};
bootstrap();

export default bootstrap;
