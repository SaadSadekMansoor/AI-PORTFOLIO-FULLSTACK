import express, { Request, Response } from "express";
import { z } from "zod";
import { validateGeneratePayload } from "../utils/validator";
import { generateWebsiteFromPrompt } from "../services/groqService";
import { storage } from "../services/storageService";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Validation schema for the /generate request body
const GenerateBodySchema = z.object({
  prompt: z.string().min(10, "Prompt too short (min 10 chars)"),
  options: z
    .object({
      includeJS: z.boolean().optional(),
      theme: z.string().optional(),
      colorScheme: z.string().optional(),
    })
    .optional(),
});

/**
 * POST /api/generate
 * Accepts a natural-language prompt and returns a generated website (HTML + optional assets).
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const parsed = validateGeneratePayload(req.body, GenerateBodySchema);

    const requestId = uuidv4();
    const createdAt = Date.now();

    // Store pending status
    await storage.storePending(requestId, { status: "pending", createdAt });
    logger.info("Generation requested", { id: requestId });

    // Call Groq service
    const html = await generateWebsiteFromPrompt(
      parsed.prompt,
      parsed.options ?? {}
    );

    if (!html) {
      await storage.storeFailed(requestId, { status: "failed" });
      return res.status(502).json({ error: "Failed to generate website" });
    }

    // Save successful result
    await storage.storeResult(requestId, {
      status: "ready",
      html,
      assets: {}, // placeholder for future assets like CSS/JS files
      metadata: {
        prompt: parsed.prompt,
        options: parsed.options ?? {},
        createdAt,
      },
    });

    return res.status(200).json({
      id: requestId,
      status: "ready",
      html,
    });
  } catch (err: any) {
    logger.error("Error in /api/generate", {
      error: err?.message ?? String(err),
    });
    return res.status(400).json({ error: err?.message ?? "Bad request" });
  }
});

/**
 * GET /api/retrieve/:id
 * Retrieves the status and result of a previously generated portfolio.
 */
router.get("/retrieve/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const item = await storage.get(id);
    if (!item) return res.status(404).json({ error: "Not found or expired" });

    return res.status(200).json({
      id,
      status: item.status,
      html: item.html,
      metadata: item.metadata,
    });
  } catch (err: any) {
    logger.error("Error in /api/retrieve/:id", {
      error: err?.message ?? String(err),
    });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
