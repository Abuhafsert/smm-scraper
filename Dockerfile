FROM node:22

# Set working directory
WORKDIR /automationscraper

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Install Playwright browsers
RUN npx playwright install
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
  libnss3\
  libdbus-1-3\
  libatk1.0-0\
  libatk-bridge2.0-0\
  libcups2\
  libxkbcommon0\ 
  libatspi2.0-0\
  libxcomposite1\ 
  libxdamage1\
  libxfixes3\ 
  libxrandr2\
  libgbm1\
  libasound2 \
  && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY index.js .

# Set environment variable for Playwright browser cache
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright

# Run the application
CMD ["npm", "start"]