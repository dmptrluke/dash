FROM python:3.8-slim
ENV PYTHONUNBUFFERED 1

# install CURL
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# add a user/group for our app to run under
RUN groupadd -r abc -g 1005 && useradd --no-log-init -u 1000 -r -g abc abc

# create folders, set work directory
RUN mkdir /config
RUN mkdir /code
WORKDIR /code

# copy requirements file and install requirements
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r /code/requirements.txt

# copy the rest of app code
COPY . /code/

# drop permissions, nothing beyond this point needs root powers
USER abc:abc

# set up healthcheck, environment variable, and run the app
HEALTHCHECK --interval=1m --timeout=5s --retries=3 \
  CMD curl -sSf http://localhost:8000/healthcheck || exit 1

ENV APPS_FILE /config/apps.json

CMD ["uvicorn", "--host=0.0.0.0", "--port=8000", "main:app"]
EXPOSE 8000/tcp
