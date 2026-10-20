// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import mongoose from "mongoose";
// import chatRoutes from "./routes/chat.js"
// import imageRoutes from "./routes/image.js";


// const app = express();
// const PORT = 8080;

// app.use(express.json());
// app.use(cors());

// app.use("/api", chatRoutes);
// app.use("/api/image", imageRoutes);
// app.listen(PORT, () => {
//     console.log(`server running on ${PORT}`);
//     connectDB();
// });

// const connectDB = async() => {
//     try{
//       await mongoose.connect(process.env.MONGODB_URI);
//       console.log("Connected with Database!");
//     } catch(err){
//       console.log("Failed to connect with Db", err);
//     }
// }







import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import imageRoutes from "./routes/image.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use("/api", chatRoutes);
app.use("/api/image", imageRoutes);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with Database!");
    } catch (err) {
        console.log("Failed to connect with Db", err);
    }
};

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
