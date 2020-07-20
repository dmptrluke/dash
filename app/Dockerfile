FROM python:3.8-slim
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r abc -g 1005 && useradd --no-log-init -u 1000 -r -g abc abc

RUN mkdir /code
WORKDIR /code

RUN mkdir /config

COPY requirements.txt /code/
RUN pip install --no-cache-dir -r /code/requirements.txt
COPY . /code/

# drop permissions!
USER abc:abc

ENV APPS_FILE /config/apps.json

HEALTHCHECK --interval=1m --timeout=5s --retries=3 \
  CMD curl -sSf http://localhost:8000/healthcheck || exit 1

CMD ["uvicorn", "--host=0.0.0.0", "--port=8000", "main:app"]
EXPOSE 8000/tcp
