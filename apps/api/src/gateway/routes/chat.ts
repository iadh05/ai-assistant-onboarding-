import { Router } from 'express';
import { ChatRequestSchema, HTTP_STATUS } from '@onboarding/shared';
import { handleGrpcError } from '../errors/index.js';

export function createChatRoutes(chatClient: any, promisifyGrpcCall: Function): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const parseResult = ChatRequestSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Validation failed',
          message: parseResult.error.issues[0]?.message || 'Invalid request',
          details: parseResult.error.issues,
        });
      }

      const { question, top_k } = parseResult.data;

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
