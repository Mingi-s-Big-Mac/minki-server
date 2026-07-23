process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?schema=public';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.LOG_LEVEL = 'silent';
process.env.ALLOWED_EMAIL_DOMAINS = 'example.ac.kr';
process.env.ACCESS_TOKEN_SECRET = 'test_access_token_secret';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_token_secret';
