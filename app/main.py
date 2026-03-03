import json
import re
from datetime import datetime
from pathlib import Path

CATEGORY_COLORS = [
    '#a371f7', '#fb8500', '#00b4d8', '#06ffa5', '#ff006e',
    '#ffd60a', '#735ffe', '#ffb703', '#8338ec', '#ff3a44',
    '#00d9ff', '#ff9500', '#ff447a', '#00f264', '#00e5ff',
]

import uvicorn
from starlette.applications import Starlette
from starlette.config import Config
from starlette.responses import PlainTextResponse
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

config = Config('.env')
APPS_FILE = config('APPS_FILE')
DEBUG_ENABLED = config('DEBUG', cast=bool, default=False)
PAGE_TITLE = config('TITLE', default='Dash')

with open(APPS_FILE) as f:
    app_list = json.load(f)

templates = Jinja2Templates(directory=Path(__file__).parent / 'templates')

app = Starlette(debug=DEBUG_ENABLED)
app.mount('/static', StaticFiles(directory=Path(__file__).parent / 'static'), name='static')


@app.route('/')
async def homepage(request):
    template = "index.html"

    user = request.headers.get('remote-user', None) or request.headers.get('X-Authentik-Name', None)
    groups_header = request.headers.get('remote-groups', None) or request.headers.get('X-Authentik-Groups', None)

    if groups_header:
        user_groups = re.split('\||,|\*|\n', groups_header)
    else:
        user_groups = []

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

    visible_apps = []
    for i, (category, contents) in enumerate(app_list.items()):
        filtered = [
            entry for entry in contents
            if not entry.get('groups')
            or set(map(str.casefold, user_groups)) & set(map(str.casefold, entry['groups']))
        ]
        if filtered:
            visible_apps.append({
                'name':    category,
                'color':   CATEGORY_COLORS[i % len(CATEGORY_COLORS)],
                'entries': filtered,
            })

    context = {
        "request": request,
        "greeting": greeting,
        "title": PAGE_TITLE,
        "apps": visible_apps,
        "user": user,
        "now": now
    }
    return templates.TemplateResponse(template, context)


@app.route('/healthcheck')
async def healthcheck(request):
    return PlainTextResponse('Hello, world!')


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=8000)
