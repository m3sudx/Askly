import { Router } from "express";
import { requireUser, requireTenantOwner } from "../../middleware/ownerAuth.js";
import { overview } from "./stats.controller.js";

const router = Router();

router.get("/", requireUser, requireTenantOwner, overview);

export default router;