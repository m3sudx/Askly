import { Router } from "express";
import widgetAuth from "../../middleware/widgetAuth.js";
import { ask } from "./chat.controller.js";

const router = Router();

router.post("/", widgetAuth, ask);

export default router;