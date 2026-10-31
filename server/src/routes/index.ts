import { Router } from "express";
import { supabase } from "../config/supabase.js";
import documentRoutes from "../modules/document/document.route.js";
import chatRoutes from "../modules/chat/chat.route.js";

const apiRouters = Router();

apiRouters.get("/health/db", async (_req, res) => {
  const { count, error } = await supabase
    .from("tenants")
    .select("id", { count: "exact", head: true });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
  res.json({ success: true, message: "Database connected", tenants: count });
});

apiRouters.use("/documents", documentRoutes);

apiRouters.use("/chat", chatRoutes);

export default apiRouters;