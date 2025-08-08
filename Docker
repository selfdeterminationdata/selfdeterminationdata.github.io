FROM node:18

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose port (Cloud Run default)
EXPOSE 8080

# Start your backend server
CMD ["npm", "run", "server"]


