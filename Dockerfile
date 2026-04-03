# Assets

FROM dhi.io/node:24-debian13-dev AS assets
WORKDIR /build
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

# Dependencies

FROM dhi.io/python:3.14-debian13-dev AS deps
WORKDIR /code

COPY --from=ghcr.io/astral-sh/uv:0.6 /uv /usr/local/bin/uv

COPY app/pyproject.toml app/uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Application (distroless)

FROM dhi.io/python:3.14-debian13
COPY --from=ghcr.io/dmptrluke/healthcheck@sha256:3e9025c3550d94f35f1c565f8e71f89c9492fa4e79e440292ab776a144c460bb /healthcheck /usr/local/bin/healthcheck
WORKDIR /code

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/code/.venv/bin:/opt/python/bin:$PATH"

COPY --from=deps /code/.venv /code/.venv
COPY app/ ./
COPY --from=assets /build/app/static/ ./static/

VOLUME /config
ENV APPS_FILE=/config/apps.json

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --start-interval=2s --retries=2 \
    CMD ["healthcheck", "http", "127.0.0.1:8000", "/healthcheck"]

EXPOSE 8000/tcp
CMD ["uvicorn", "--host=0.0.0.0", "--port=8000", "main:app"]
