# Assets

FROM node:22-slim AS assets
WORKDIR /build
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

# Application

FROM python:3.14-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /code

COPY --from=ghcr.io/astral-sh/uv:0.6 /uv /usr/local/bin/uv

RUN --mount=type=cache,target=/var/lib/apt/lists \
    --mount=type=cache,target=/var/cache/apt \
    apt-get update \
    && apt-get install -y --no-install-recommends curl

RUN groupadd -r abc -g 1000 && useradd --no-log-init -u 1000 -r -g abc abc

RUN mkdir /config && chown abc:abc /config

COPY app/pyproject.toml app/uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

ENV PATH="/code/.venv/bin:$PATH"

RUN rm /usr/local/bin/uv

COPY app/ ./
COPY --from=assets /build/app/static/ ./static/

USER abc:abc

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --start-interval=2s --retries=2 \
    CMD curl -sf http://localhost:8000/healthcheck || exit 1

ENV APPS_FILE=/config/apps.json

EXPOSE 8000/tcp
CMD ["uvicorn", "--host=0.0.0.0", "--port=8000", "main:app"]
