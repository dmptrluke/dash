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
WORKDIR /code

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/code/.venv/bin:/opt/python/bin:$PATH"

COPY --from=deps /code/.venv /code/.venv
COPY app/ ./
COPY --from=assets /build/app/static/ ./static/

VOLUME /config
ENV APPS_FILE=/config/apps.json

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --start-interval=2s --retries=2 \
    CMD ["python3", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthcheck')"]

EXPOSE 8000/tcp
CMD ["uvicorn", "--host=0.0.0.0", "--port=8000", "main:app"]
