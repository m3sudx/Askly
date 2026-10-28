import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../util/error.js";
import { createDocumentSchema } from "./document.schema.js";
import { createDocument, listDocuments, deleteDocument } from "./document.service.js";

const tenantQuery = z.object({ tenantId: z.string().uuid() });

export const create: RequestHandler = async (req, res, next) => {
  try {
    const parsed = createDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        400
      );
    }
    const data = await createDocument(parsed.data);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const list: RequestHandler = async (req, res, next) => {
  try {
    const q = tenantQuery.safeParse(req.query);
    if (!q.success) throw new AppError("tenantId (uuid) is required", 400);
    res.json({ success: true, data: await listDocuments(q.data.tenantId) });
  } catch (err) {
    next(err);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const q = tenantQuery.safeParse(req.query);
    if (!q.success) throw new AppError("tenantId (uuid) is required", 400);
    await deleteDocument(q.data.tenantId, String(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};