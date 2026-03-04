# Stage 1: Build frontend assets
FROM node:24-alpine AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Python application
FROM python:3.14-slim
ENV PYTHONUNBUFFERED=1

# install CURL
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# add a user/group for our app to run under
RUN groupadd -r abc -g 1000 && useradd --no-log-init -u 1000 -r -g abc abc

# set work directory, create config folder
WORKDIR /code
RUN mkdir /config && chown abc:abc /config

# copy requirements file and install requirements
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy the rest of app code
COPY app/ ./

# copy all bundled static assets from the frontend stage
COPY --from=frontend /build/app/static/ ./static/

# drop permissions, nothing beyond this point needs root powers
USER abc:abc

# set up healthcheck, environment variable, and run the app
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --start-interval=2s --retries=2 \
    CMD curl -sf http://localhost:8000/healthcheck || exit 1

ENV APPS_FILE=/config/apps.json

EXPOSE 8000/tcp
CMD ["uvicorn", "--host=0.0.0.0", "--port=8000", "main:app"]
