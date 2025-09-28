import type { Request, Response } from 'express';
import { AmountExtractionService } from '../services/amount-extraction';

export class AmountExtractionController {
  constructor(private readonly svc: AmountExtractionService, private readonly isInitialized: () => boolean) {}

  step1 = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!this.isInitialized()) {
        return res.status(503).json({ status: 'error', message: 'Services not initialized' });
      }
      const { text } = req.body as any;
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ status: 'error', message: 'Text input is required' });
      }
      const result = await this.svc.extractRawTokens(text);
      return res.json({ status: 'success', step: 1, result });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Step 1 processing failed', error: (error as Error).message });
    }
  };

  step2 = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!this.isInitialized()) {
        return res.status(503).json({ status: 'error', message: 'Services not initialized' });
      }
      const { text } = req.body as any;
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ status: 'error', message: 'Text input is required' });
      }
      const step1Result = await this.svc.extractRawTokens(text);
      if ('status' in step1Result && step1Result.status === 'no_amounts_found') {
        return res.status(400).json({ status: 'error', message: 'No amounts found in text' });
      }
      const rawTokensResult = step1Result as any;
      const result = await this.svc.normalizeAmounts(rawTokensResult.raw_tokens);
      return res.json({ status: 'success', step: 2, result, raw_tokens: rawTokensResult.raw_tokens });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Step 2 processing failed', error: (error as Error).message });
    }
  };

  step3 = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!this.isInitialized()) {
        return res.status(503).json({ status: 'error', message: 'Services not initialized' });
      }
      const { text } = req.body as any;
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ status: 'error', message: 'Text input is required' });
      }
      const step1Result = await this.svc.extractRawTokens(text);
      if ('status' in step1Result && step1Result.status === 'no_amounts_found') {
        return res.status(400).json({ status: 'error', message: 'No amounts found in text' });
      }
      const rawTokensResult = step1Result as any;
      const step2Result = await this.svc.normalizeAmounts(rawTokensResult.raw_tokens);
      const result = await this.svc.classifyAmounts(text, step2Result.normalized_amounts);
      return res.json({ status: 'success', step: 3, result, raw_tokens: rawTokensResult.raw_tokens, normalized_amounts: step2Result.normalized_amounts });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Step 3 processing failed', error: (error as Error).message });
    }
  };

  step4 = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!this.isInitialized()) {
        return res.status(503).json({ status: 'error', message: 'Services not initialized' });
      }
      const { text } = req.body as any;
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ status: 'error', message: 'Text input is required' });
      }
      const step1Result = await this.svc.extractRawTokens(text);
      if ('status' in step1Result && step1Result.status === 'no_amounts_found') {
        return res.status(400).json({ status: 'error', message: 'No amounts found in text' });
      }
      const rawTokensResult = step1Result as any;
      const step2Result = await this.svc.normalizeAmounts(rawTokensResult.raw_tokens);
      const step3Result = await this.svc.classifyAmounts(text, step2Result.normalized_amounts);
      const result = await this.svc.generateFinalOutput(text, rawTokensResult.currency_hint, step3Result.amounts);
      return res.json({ status: 'success', step: 4, result, raw_tokens: rawTokensResult.raw_tokens, normalized_amounts: step2Result.normalized_amounts, classified_amounts: step3Result.amounts });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Step 4 processing failed', error: (error as Error).message });
    }
  };

  pipeline = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!this.isInitialized()) {
        return res.status(503).json({ status: 'error', message: 'Services not initialized' });
      }
      const { text } = req.body as any;
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ status: 'error', message: 'Text input is required' });
      }
      const result = await this.svc.executeFullPipeline(text);
      return res.json({ status: 'success', pipeline: 'complete', result });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Complete pipeline processing failed', error: (error as Error).message });
    }
  };
}


