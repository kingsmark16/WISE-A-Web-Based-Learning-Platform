import { Router } from "express";
import { completeCourse } from "../controllers/completionsController.js";
import { requireRole } from "../middlewares/authMiddleware.js"; // your file

const r = Router();

r.post(
  "/courses/:courseId/complete",
  requireRole(["STUDENT"]),
  (req, res, next) => {
    req.body = req.body || {};
    req.body.courseId = req.params.courseId;
    return completeCourse(req, res, next);
  }
);
export default r;
