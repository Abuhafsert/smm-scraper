FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Install Playwright browsers
RUN npx playwright install-deps

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libxkbcommon-x11-0 \
  libdrm2 \
  libgbm1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libasound2 \
  && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY index.js .

# Set environment variable for Playwright browser cache
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright

# Run the application
CMD ["npm", "start"]