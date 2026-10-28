import { Router } from "express";
import documentRoutes from "../modules/document/document.route.js";

const apiRouters = Router();

apiRouters.use("/documents", documentRoutes);

export default apiRouters;