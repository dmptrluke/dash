FROM python:3.9-slim
ENV PYTHONUNBUFFERED 1

# install CURL
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# add a user/group for our app to run under
RUN groupadd -r abc -g 1005 && useradd --no-log-init -u 1000 -r -g abc abc

# set work directory, create config folder
WORKDIR /code
RUN mkdir /config

# copy requirements file and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy the rest of app code
COPY . ./

# drop permissions, nothing beyond this point needs root powers
USER abc:abc

# set up healthcheck, environment variable, and run the app
HEALTHCHECK --interval=1m --timeout=5s --retries=3 \
  CMD curl -sSf http://localhost:8000/healthcheck || exit 1

ENV APPS_FILE /config/apps.json

CMD ["uvicorn", "--host=0.0.0.0", "--port=8000", "main:app"]
EXPOSE 8000/tcp
