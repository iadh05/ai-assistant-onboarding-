import { Router } from 'express';
import { handleGrpcError } from '../errors/index.js';

export function createHealthRoutes(systemClient: any, promisifyGrpcCall: Function): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      console.log('[REST Gateway] Health check requested');
      const response = await promisifyGrpcCall(systemClient, 'healthCheck', {});
      res.json(response);
    } catch (error) {
      handleGrpcError(res, error, 'Health check failed');
    }
  });

  return router;
}
