import { Request, Response } from "express";
import sql from "../lib/db";
import { pusherServer } from "../lib/pusher";

// @desc    Get polls
// @route   GET /poll
// @access  Public
export const getPolls = async (req: Request, res: Response) => {
  try {
    const polls = await sql`SELECT * FROM poll`;

    return res.status(200).json(polls);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// @desc    Get a poll
// @route   GET /poll/:id
// @access  Public
export const getPoll = async (req: Request, res: Response) => {
  try {
    const pollId = req.params.id;

    const poll =
      await sql`SELECT id, name, endat AT TIME ZONE 'GMT' AS endat FROM poll WHERE id = ${pollId}`;

    if (!poll.length) {
      return res.status(404).send("Poll not found");
    }

    let id = req.query.id;
    if (!req.query.id) {
      id = (Math.random() + 1).toString(36).substring(2);
    }

    const pollOptions = await sql`SELECT * FROM option WHERE poll_id = ${pollId}`;

    let options = [];
    let totalVotes = 0;
    let voted = null;
    for (let i = 0; i < pollOptions.length; i++) {
      const votes =
        await sql`SELECT * FROM vote WHERE option_id = ${pollOptions[i]["id"]}`;

      for (let j = 0; j < votes.length; j++) {
        if (votes[j]["voter_id"] == id) {
          voted = pollOptions[i]["id"];
          break;
        }
      }

      const option = {
        id: pollOptions[i]["id"],
        name: pollOptions[i]["name"],
        votes: votes.length,
      };

      totalVotes += votes.length;

      options.push(option);
    }

    const pollData = {
      id: poll[0]["id"],
      name: poll[0]["name"],
      endAt: new Date(poll[0]["endat"]),
      options,
      voterId: id,
      totalVotes,
      voted,
    };

    res.cookie("id", id);
    return res.status(200).json(pollData);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// @desc    Create a poll
// @route   POST /poll
// @access  Private
export const createPoll = async (req: Request, res: Response) => {
  try {
    const { name, endAt, options } = req.body;

    if (!Object.keys(req.body).length) {
      return res.status(400).send("Request body is empty");
    }

    if (!name || !endAt || !options) {
      return res
        .status(400)
        .send(
          "Invalid data provided, please provide name, endAt and options for the poll"
        );
    }

    const poll = await sql`INSERT INTO poll (name, endAt) VALUES (${name}, ${new Date(
      endAt
    )}) RETURNING *`;

    const pollId = poll[0]["id"];

    for (let i = 0; i < options.length; i++) {
      await sql`INSERT INTO option (name, poll_id) VALUES (${options[i]}, ${pollId})`;
    }

    return res.status(201).json(poll[0]);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// @desc    Delete a poll
// @route   DELETE /poll/:id
// @access  Private
export const deletePoll = async (req: Request, res: Response) => {
  try {
    const pollId = req.params.id;

    const poll = await sql`DELETE FROM poll WHERE id = ${pollId} RETURNING *`;

    return res.status(200).json(poll[0]);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// @desc    Vote to a poll
// @route   POST /poll/:pollId/vote/:optionId
// @access  Public
export const vote = async (req: Request, res: Response) => {
  try {
    const pollId = req.params.pollId;
    const optionId = req.params.optionId;

    let id = req.body.id;
    if (!req.body.id) {
      id = (Math.random() + 1).toString(36).substring(2);
    }

    const checkVote =
      await sql`SELECT * FROM vote WHERE option_id = ${optionId} AND voter_id = ${id}`;

    if (checkVote.length) {
      return res.status(403).send("Already voted on this poll");
    }

    const poll =
      await sql`SELECT *, endat AT TIME ZONE 'GMT' AS endat FROM poll WHERE id = ${pollId}`;

    if (!poll.length) {
      return res.status(404).send("Poll not found");
    }

    const timeLeft = (new Date(poll[0]["endat"]).valueOf() - new Date().valueOf()) / 1000;

    if (timeLeft <= 0) {
      return res.status(403).send("Poll time ended");
    }

    const option = await sql`SELECT * FROM option WHERE id = ${optionId}`;

    if (!option.length) {
      return res.status(404).send("Option not found");
    }

    await sql`INSERT INTO vote (option_id, voter_id) VALUES (${optionId}, ${id})`;

    const optionObject = {
      id: option[0]["id"],
      name: option[0]["name"],
      voterId: id,
    };

    await pusherServer.trigger(`poll-${pollId}`, "votes", optionObject);

    res.cookie("id", id);
    return res.status(201).json(optionObject);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};
