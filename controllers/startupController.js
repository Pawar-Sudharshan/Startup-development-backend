import { analyzeStartup, generateScenario, generateFeedback, evolveStartup } from '../services/aiService.js';
import { buildInitialState, simulateStep } from '../services/simulationService.js';
import { getSession, setSession } from '../utils/store.js';
import { Project } from '../models/Project.js';
import crypto from 'crypto';

export const analyzeAndInit = async (req, res, next) => {
  try {
    const { problem, solution, target_users, budget } = req.body;
    if (!problem || !solution || !target_users || budget == null) {
      return res.status(400).json({ error: "Missing required fields: problem, solution, target_users, budget" });
    }

    // 1. AI Analysis
    const analysis = await analyzeStartup(req.body);

    // 2. Build initial state from analysis and initial budget
    const initialState = buildInitialState(analysis, budget, req.body);

    // 3. Save to memory store (QOL feature allowing frontend to track via session)
    const sessionId = crypto.randomUUID();
    setSession(sessionId, initialState);

    res.json({
      ...analysis,
      _initialState: initialState,
      _sessionId: sessionId
    });
  } catch (error) {
    next(error);
  }
};

import { getAuth } from '@clerk/express';

export const saveToWatchlist = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    console.log("saveToWatchlist EXACT getAuth output:", auth);
    
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Unauthorized - Clerk failed to find user ID from header." });
    }
    
    const clerkUserId = auth.userId;
    const { problemStatement, solution, llmResponse } = req.body;

    if (!problemStatement || !solution || !llmResponse) {
      return res.status(400).json({ error: "Missing required fields: problemStatement, solution, llmResponse" });
    }

    const newProject = new Project({
      clerkUserId,
      problemStatement,
      solution,
      llmResponse
    });
    
    await newProject.save();
    res.status(200).json({ success: true, project: newProject });
  } catch (dbError) {
    console.error("Detailed MongoDB Error:", dbError);
    return res.status(500).json({ success: false, error: dbError.message, fullError: dbError });
  }
};

export const getWatchlist = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) return res.status(401).json({ error: "Unauthorized" });
    const projects = await Project.find({ clerkUserId: auth.userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

export const iterateProject = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) return res.status(401).json({ error: "Unauthorized" });
    const clerkUserId = auth.userId;
    const { projectId } = req.body;
    
    if (!projectId) return res.status(400).json({ error: "Missing projectId" });
    
    const oldProject = await Project.findOne({ _id: projectId, clerkUserId });
    if (!oldProject) return res.status(404).json({ error: "Project not found" });
    
    const evolved = await evolveStartup(
      oldProject.problemStatement, 
      oldProject.solution, 
      oldProject.llmResponse
    );
    
    const count = await Project.countDocuments({ clerkUserId });
    if (count >= 10) {
      const oldest = await Project.findOne({ clerkUserId }).sort({ createdAt: 1 });
      if (oldest) await Project.findByIdAndDelete(oldest._id);
    }
    
    const newProject = new Project({
      clerkUserId,
      problemStatement: evolved.new_problem,
      solution: evolved.new_solution,
      llmResponse: evolved.analysis
    });
    await newProject.save();
    
    res.json(newProject);
  } catch (err) {
    next(err);
  }
};

export const simulateStepPrompt = async (req, res, next) => {
  try {
    const { state, decision } = req.body;
    if (!state || !decision) {
      return res.status(400).json({ error: "Missing state or decision field" });
    }

    const newState = await generateMathStep(state, decision);
    res.json({ new_state: newState });
  } catch (err) {
    next(err);
  }
};

export const simulateAndProgress = async (req, res, next) => {
  try {
    const { state, decision } = req.body;
    if (!state || !decision) {
      return res.status(400).json({ error: "Missing state or decision field" });
    }

    const newState = simulateStep(state, decision);
    res.json({ new_state: newState });
  } catch (err) {
    next(err);
  }
};

export const scenarioPrompt = async (req, res, next) => {
  try {
    const { state, difficultyLevel, mode } = req.body;
    if (!state) return res.status(400).json({ error: "Missing state field" });

    const scenarioData = await generateScenario(state, difficultyLevel, mode);
    res.json(scenarioData);
  } catch (err) {
    next(err);
  }
};

export const feedbackPrompt = async (req, res, next) => {
  try {
    const { previous_state, decision, new_state, type, mode } = req.body;
    if (!previous_state || !decision || !new_state) {
      return res.status(400).json({ error: "Missing previous_state, decision, or new_state fields" });
    }

    const feedbackData = await generateFeedback(previous_state, decision, new_state, type || 'explain', mode);
    res.json(feedbackData);
  } catch (err) {
    next(err);
  }
};
