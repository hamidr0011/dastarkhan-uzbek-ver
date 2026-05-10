FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy application files
COPY . .

# Expose Expo ports
EXPOSE 8081 19000 19001 19002

# Start the Expo development server
CMD ["npm", "start"]
