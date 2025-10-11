import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Always load backend/.env regardless of where Node is started
config({ path: path.join(__dirname, "..", ".env") });
