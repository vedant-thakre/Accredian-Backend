import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from './Routes/userRoutes.js';
import fileUpload from 'express-fileupload';

export const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  })
);

// Router
app.use("/api/v1", userRoute);

app.get("/", (req, res)=> {
    res.send("Server is Live");
});