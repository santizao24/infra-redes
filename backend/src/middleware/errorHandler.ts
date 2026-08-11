import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err && typeof err === 'object' && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } };
    if (prismaErr.code === 'P2002') {
      const targets = prismaErr.meta?.target || [];
      if (targets.includes('referencia')) {
        return res.status(400).json({ error: 'A referência indicada já está a ser utilizada por outra obra.' });
      }
      if (targets.includes('email')) {
        return res.status(400).json({ error: 'O endereço de email indicado já está registado.' });
      }
      if (targets.includes('codigo')) {
        return res.status(400).json({ error: 'O código de material indicado já está em utilização.' });
      }
      return res.status(400).json({
        error: `O valor indicado já existe na base de dados (${targets.join(', ')}).`,
      });
    }
  }

  if (err instanceof Error) {
    console.error(err);
    // Don't expose database internal stack traces or exact messages in production
    const isProd = process.env.NODE_ENV === 'production';
    return res.status(500).json({ 
      error: isProd ? 'Ocorreu um erro interno no servidor.' : (err.message || 'Erro interno do servidor') 
    });
  }

  return res.status(500).json({ error: 'Erro interno do servidor' });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
