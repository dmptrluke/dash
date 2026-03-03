import json
import logging
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

CATEGORY_COLORS = [
    '#a371f7', '#fb8500', '#00b4d8', '#06ffa5', '#ff006e',
    '#ffd60a', '#735ffe', '#ffb703', '#8338ec', '#ff3a44',
    '#00d9ff', '#ff9500', '#ff447a', '#00f264', '#00e5ff',
]

import uvicorn
from starlette.applications import Starlette
from starlette.config import Config
from starlette.middleware import Middleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.requests import Request
from starlette.responses import PlainTextResponse, Response
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

# Load configuration with error handling
try:
    config = Config('.env')
except FileNotFoundError:
    logger.warning('.env file not found, using environment variables only')
    config = Config()

APPS_FILE = config('APPS_FILE')
DEBUG_ENABLED = config('DEBUG', cast=bool, default=False)
PAGE_TITLE = config('TITLE', default='Dash')
FONT_FAMILY_RAW = config('FONT_FAMILY', default=None)

# Sanitize font family to prevent CSS injection
FONT_FAMILY: Optional[str] = None
if FONT_FAMILY_RAW:
    # Only allow alphanumeric, spaces, hyphens, and commas (for font stacks)
    if re.match(r'^[a-zA-Z0-9\s,\-]+$', FONT_FAMILY_RAW):
        FONT_FAMILY = FONT_FAMILY_RAW
    else:
        logger.warning(f'Invalid FONT_FAMILY value: {FONT_FAMILY_RAW}. Ignoring.')

# Load and validate apps configuration
def load_apps_config(file_path: str) -> Dict[str, List[Dict[str, Any]]]:
    """Load and validate the apps.json configuration file."""
    apps_path = Path(file_path)

    if not apps_path.exists():
        logger.error(f'Apps configuration file not found: {file_path}')
        sys.exit(1)

    try:
        with open(apps_path) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f'Invalid JSON in apps configuration file: {e}')
        sys.exit(1)
    except Exception as e:
        logger.error(f'Error reading apps configuration file: {e}')
        sys.exit(1)

    # Validate structure
    if not isinstance(data, dict):
        logger.error('Apps configuration must be a JSON object with categories')
        sys.exit(1)

    for category, apps in data.items():
        if not isinstance(apps, list):
            logger.error(f'Category "{category}" must contain a list of apps')
            sys.exit(1)

        for i, app in enumerate(apps):
            if not isinstance(app, dict):
                logger.error(f'App {i} in category "{category}" must be an object')
                sys.exit(1)

            # Validate required fields
            required_fields = ['name', 'icon', 'url']
            for field in required_fields:
                if field not in app:
                    logger.error(f'App "{app.get("name", f"index {i}")}" in category "{category}" missing required field: {field}')
                    sys.exit(1)

    logger.info(f'Successfully loaded {sum(len(apps) for apps in data.values())} apps from {len(data)} categories')
    return data

app_list = load_apps_config(APPS_FILE)

templates = Jinja2Templates(directory=Path(__file__).parent / 'templates')

app = Starlette(debug=DEBUG_ENABLED)


def add_security_headers(response: Response) -> Response:
    """Add security headers to response."""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    # CSP: Allow self for scripts/styles, iconify for icons
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https://api.iconify.design; "
        "font-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none'"
    )
    return response


@app.route('/')
async def homepage(request: Request) -> Response:
    """Render the main dashboard page."""
    template = "index.html"

    # Extract user information from headers (set by auth proxy)
    user = request.headers.get('remote-user') or request.headers.get('X-Authentik-Name')
    groups_header = request.headers.get('remote-groups') or request.headers.get('X-Authentik-Groups')

    # Parse and normalize user groups
    user_groups: List[str] = []
    if groups_header:
        # Split on common delimiters and strip whitespace
        user_groups = [g.strip() for g in re.split(r'[|,*\n]', groups_header) if g.strip()]

    now = datetime.now()

    # Determine time-based greeting
    if now.hour < 5 or now.hour >= 22:
        greeting = 'Good night'
    elif now.hour < 12:
        greeting = 'Good morning'
    elif now.hour < 17:
        greeting = 'Good afternoon'
    else:
        greeting = 'Good evening'

    if user:
        user = user.title()
        greeting = f'{greeting}, {user}'

    greeting += '!'

    # Filter apps based on user's group membership
    visible_apps: List[Dict[str, Any]] = []
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
        "now": now,
        "font_family": FONT_FAMILY,
    }

    response = templates.TemplateResponse(template, context)
    return add_security_headers(response)


@app.route('/healthcheck')
async def healthcheck(request: Request) -> PlainTextResponse:
    """Health check endpoint for container orchestration."""
    return PlainTextResponse('Hello, world!')


app.mount('/static', StaticFiles(directory=Path(__file__).parent / 'static'), name='static')
app.mount('/', StaticFiles(directory=Path(__file__).parent / 'assets'), name='assets')


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=8000)
