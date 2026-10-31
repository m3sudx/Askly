import { Router } from "express";
import { requireUser } from "../../middleware/ownerAuth.js";
import { create, list, update } from "./tenant.controller.js";

const router = Router();

router.use(requireUser);

router.get("/", list);
router.post("/", create);
router.patch("/:id", update);

export default router;