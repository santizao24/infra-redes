import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import obrasRoutes from './routes/obras.js';
import stockRoutes from './routes/stock.js';
import dashboardRoutes from './routes/dashboard.js';
import publicRoutes from './routes/public.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Trust reverse proxies (Render, Vercel) for accurate client IP detection
app.set('trust proxy', 1);

// HTTP Security Headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Strict CORS setup
const allowedOrigins = process.env.CLIENT_URL
  ? [
      process.env.CLIENT_URL,
      'https://infra-redes-ashy.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ]
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error('Bloqueado por política de CORS'));
    },
    credentials: true,
  })
);

// Payload size limit (prevent large body DOS attacks)
app.use(express.json({ limit: '1mb' }));

// Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // limite de 300 pedidos por janela por IP
  message: { error: 'Muitos pedidos enviados a partir deste IP. Tente novamente mais tarde.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo de 10 tentativas de login por IP por 15 minutos
  message: { error: 'Demasiadas tentativas de login. Por razões de segurança, tente novamente em 15 minutos.' },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo de 5 contactos por IP por 15 minutos
  message: { error: 'Enviou demasiadas mensagens de contacto. Tente novamente mais tarde.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/public/contacto', contactLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/obras', obrasRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);

app.use(errorHandler);

export default app;
