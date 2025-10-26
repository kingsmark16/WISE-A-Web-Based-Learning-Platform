import { Router } from "express";
import { listMine, verifyPublic } from "../controllers/certificatesController.js";
import { requireRole } from "../middlewares/authMiddleware.js";

const r = Router();
r.get("/verify", verifyPublic);                                           // public
r.get("/certificates/me", requireRole(["STUDENT","FACULTY","ADMIN"]), listMine);
export default r;
