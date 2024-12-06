import express from "express";
import {
  createSpeakerProfile,
  getSpeakerProfile,
  getSpeakerById,
  updateSpeakerProfile,
  getAllSpeakers,
  deleteSpeakerProfile,
} from "../services/speakerService";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { userId, profileData } = req.body;
    const speaker = await createSpeakerProfile(userId, profileData);
    res.status(201).json(speaker);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const speaker = await getSpeakerProfile(userId);
    res.status(200).json(speaker);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/id/:speakerId", async (req, res) => {
  try {
    const { speakerId } = req.params;
    const speaker = await getSpeakerById(speakerId);
    res.status(200).json(speaker);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.put("/update/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;
    const updatedSpeaker = await updateSpeakerProfile(userId, profileData);
    res.status(200).json(updatedSpeaker);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const speakers = await getAllSpeakers();
    res.status(200).json(speakers);
  } catch (error) {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

router.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedSpeaker = await deleteSpeakerProfile(userId);
    res.status(200).json(deletedSpeaker);
  } catch (error) {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

export default router;
