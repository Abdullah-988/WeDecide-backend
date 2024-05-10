import express, { Response } from "express";
import { loginUser } from "../controllers/userController";
import {
  getPolls,
  createPoll,
  getPoll,
  deletePoll,
  vote,
} from "../controllers/pollController";
import { protect } from "../middleware/authMiddleware";
import sql from "../lib/db";

const router = express.Router();

router.post("/login", loginUser);

router.get("/poll", getPolls);
router.post("/poll", protect, createPoll);
router.get("/poll/:id", getPoll);
router.delete("/poll/:id", protect, deletePoll);

router.post("/poll/:pollId/vote/:optionId", vote);

export default router;
