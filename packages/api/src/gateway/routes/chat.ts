import { Router } from 'express';
import { handleGrpcError } from '../errors/index.js';

export function createChatRoutes(chatClient: any, promisifyGrpcCall: Function): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const { question, top_k = 5 } = req.body;
      if (!question) {
        return res.status(400).json({
          error: 'Question is required',
          message: 'Please enter a question.'
        });
      }

      console.log(`[REST Gateway] Chat request: "${question}"`);
      const response = await promisifyGrpcCall(chatClient, 'askQuestion', {
        question,
        top_k,
      });

      res.json(response);
    } catch (error) {
      handleGrpcError(res, error, 'Chat request failed');
    }
  });

  return router;
}
