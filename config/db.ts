import { drizzle } from "drizzle-orm/neon-http";

export function getDb() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error("DATABASE_URL environment variable is not set");
    }
    try {
        return drizzle(url);
    } catch (error) {
        console.error("Failed to connect to database:", error);
        throw error;
    }
}
