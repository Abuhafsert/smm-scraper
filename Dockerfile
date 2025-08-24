# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/playwright:v1.55.0-jammy

RUN npm install -g npm@10.1.0
RUN pip install --no-cache-dir -r requirements.txt # requirements.txt contains playwright
RUN playwright install
RUN playwright install-dep

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm i

# Copy the rest of the files into the image.
COPY . .

CMD npx playwright --version