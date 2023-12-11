import { app } from "./app.js";
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();
// connectDB();

app.listen(process.env.PORT, ()=>{
    console.log(`Server is Connectec on PORT ${process.env.PORT}`.yellow.bold);
})