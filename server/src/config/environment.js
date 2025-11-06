import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5001;
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
export const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
export const NODE_ENV = process.env.NODE_ENV || 'development';