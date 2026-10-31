import { Router } from "express";
import widgetAuth from "../../middleware/widgetAuth.js";
import { chatIpLimiter, chatTenantLimiter } from "../../middleware/rateLimit.js";
import { ask } from "./chat.controller.js";

const router = Router();

router.post("/", chatIpLimiter, widgetAuth, chatTenantLimiter, ask);

export default router;