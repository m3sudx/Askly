import { Router } from "express";
import { requireUser, requireTenantOwner } from "../../middleware/ownerAuth.js";
import { create, list, remove } from "./document.controller.js";

const router = Router();

router.use(requireUser, requireTenantOwner);

router.post("/", create);
router.get("/", list);
router.delete("/:id", remove);

export default router;