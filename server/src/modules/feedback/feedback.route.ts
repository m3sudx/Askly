import { Router } from "express";
import widgetAuth from "../../middleware/widgetAuth.js";
import { feedbackIpLimiter } from "../../middleware/rateLimit.js";
import { rate } from "./feedback.controller.js";

const router = Router();

router.post("/", feedbackIpLimiter, widgetAuth, rate);

export default router;