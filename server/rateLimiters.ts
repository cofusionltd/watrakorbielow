import rateLimit from 'express-rate-limit';

// Disable proxy header warnings since reverse proxy (Cloud Run) is configured with app.set('trust proxy', 1)
const rateLimitValidateConfig = {
  xForwardedForHeader: false,
  forwardedHeader: false,
};

// Rate limiter for AI Chat Concierge (/api/chat)
export const chatRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 35, // 35 requests per 10 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: rateLimitValidateConfig,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    reply: '⚠️ Przekroczono limit zapytań do asystenta AI. Prosimy odczekać kilka minut lub skontaktować się bezpośrednio z recepcją pod numerem +48 511 660 511.'
  }
});

// Rate limiter for reservations (/api/booking/reserve)
export const bookingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // 15 reservations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: rateLimitValidateConfig,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Zbyt wiele prób rezerwacji z tego adresu IP w krótkim czasie. Prosimy o kontakt telefoniczny z recepcją: +48 511 660 511.'
  }
});

// Rate limiter for admin login attempts (/api/admin/login)
export const adminLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // 8 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  validate: rateLimitValidateConfig,
  message: {
    success: false,
    error: 'Zbyt wiele nieudanych prób logowania do panelu administratora. Spróbuj ponownie za 15 minut.'
  }
});
