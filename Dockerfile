FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy frontend files
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# Set working directory to backend
WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "server.js"]
