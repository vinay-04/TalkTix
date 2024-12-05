import { Router } from "express";
import { createSpeaker, getSpeakerById } from "../services/speakerService";

const router = Router();

// Create Speaker Profile (Protected Route)
router.post("/create", async (req, res) => {
  try {
    const { userId, expertise, pricePerHour } = req.body;
    const newSpeaker = await createSpeaker({
      userId,
      expertise,
      pricePerHour,
      id: null,
      get: null,
      _creationAttributes: null,
      user: null,
    });
    res
      .status(201)
      .json({ message: "Speaker profile created", speaker: newSpeaker });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : error });
  }
});

// Get Speaker by ID
router.get("/:id", async (req, res) => {
  try {
    const speaker = await getSpeakerById(Number(req.params.id));
    res.status(200).json(speaker);
  } catch (error) {
    res
      .status(404)
      .json({ error: error instanceof Error ? error.message : error });
  }
});

export default router;
