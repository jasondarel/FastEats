import logger from "./loggerInit.js";
import dotenv from "dotenv";

const envInit = () => {
    const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";
    dotenv.config({ path: envFile });
}

export default envInit;