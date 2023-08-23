import json
from datetime import datetime

import uvicorn
from starlette.applications import Starlette
from starlette.config import Config
from starlette.responses import PlainTextResponse
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

config = Config('.env')
APPS_FILE = config('APPS_FILE')

with open(APPS_FILE) as f:
    app_list = json.load(f)

templates = Jinja2Templates(directory='/code/templates')

app = Starlette(debug=True)
app.mount('/static', StaticFiles(directory='/code/static'), name='static')


@app.route('/')
async def homepage(request):
    template = "index.html"

    user = request.headers.get('X-Authentik-Name', None)

    now = datetime.now()

    if now.hour < 5:
        greeting = 'Good night'
    elif now.hour < 12:
        greeting = 'Good morning'
    elif now.hour < 17:
        greeting = 'Good afternoon'
    elif now.hour < 22:
        greeting = 'Good evening'
    else:
        greeting = 'Good night'

    if user:
        user = user.title()
        greeting = f'{greeting}, {user}'

    greeting += '!'

    context = {
        "request": request,
        "greeting": greeting,
        "apps": app_list,
        "user": user,
        "now": now
    }
    return templates.TemplateResponse(template, context)


@app.route('/healthcheck')
async def healthcheck(request):
    return PlainTextResponse('Hello, world!')


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=8000)
