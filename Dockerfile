FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies (leverage Docker cache)
COPY package.json .
RUN npm install

# Install Playwright dependencies and browsers
RUN npx playwright install-deps
RUN npx playwright install

# Install additional system dependencies (if needed beyond playwright install-deps)
RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libdbus-1-3 \
  libcups2 \
  libxkbcommon0 \
  libatspi2.0-0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libdrm2 \
  libgbm1 \
  libasound2 \
  && rm -rf /var/lib/apt/lists/*

# Copy the entire project directory
COPY . .

# Set environment variable for Playwright browser cache
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright

# Health check (adjust endpoint if needed)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:${PORT:-3000}/ || exit 1

# Run the application
CMD ["npm", "start"]