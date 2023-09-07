/**
 * @description This file contain database configuration using mongoose
 * @author {Deo Sbrn}
 */

import mongoose from "mongoose";
import { MONGO_URI } from "./env";

/**
 * @description Connect to MongoDB Database
 * @returns {Promise<void>} - Promise object of void
 */
export default async function database(): Promise<void> {
    const connect = async () => {
        try {
            const conn = await mongoose.connect(MONGO_URI);
            const message = `MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`;
            console.log(message);
        } catch (error) {
            console.error("Error connecting to database: ", error);
            return process.exit(1);
        }
    };

    await connect();

    mongoose.connection.on("disconnected", connect);
}
