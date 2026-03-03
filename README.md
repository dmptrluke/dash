# dash
A sweet and simple Docker dashboard for home server usage.

To run `dash`, you can use the following `docker-compose.yml` file.
```yaml
---
services:
  dash:
    image: ghcr.io/dmptrluke/dash:latest
    container_name: dash
    restart: always
    environment:
      - TZ=Pacific/Auckland
    ports:
      - "8000:8000"
    volumes:
      - ./apps.json:/config/apps.json
```
## Configuration 
`dash` is configured using a simple `apps.json` file. An example is included below. Modify the file, and mount it into your container as `/config/apps.json`. Any icon from [iconify](https://icon-sets.iconify.design/) can be used.
```json
{
  "Watch": [
    {
      "name": "Plex",
      "icon": "mdi:plex",
      "description": "Movies and TV",
      "url": "https://plex.example.com/"
    },
    {
      "name": "Jellyfin",
      "icon": "cbi:jellyfin",
      "description": "Movies and TV",
      "url": "https://jf.example.com/"
    }
  ],
  "Home": [
    {
      "name": "Home Assistant",
      "icon": "mdi:home-assistant",
      "description": "Control and Monitor",
      "url": "https://homeassistant.example.com/"
    }
  ]
}
```

### Advanced Features

`dash` supports hiding apps based on the user's groups, as provided by [authentik](https://goauthentik.io/) or similar apps via the `remote-groups` or `X-authentik-groups` headers.

Add a `groups` field to any app entry with a list of group names that are allowed to see that app. Apps without a `groups` field are visible to everyone. If no groups header is found, only apps with no required groups are shown. If all apps in a section are hidden, the section itself is also hidden.

```json
{
  "name": "Jellyfin",
  "icon": "cbi:jellyfin",
  "description": "Movies and TV",
  "url": "https://jf.example.com/",
  "groups": ["media", "admins"]
}
```
 
This projects user interface was originally derived from [jeroenpardon/sui](https://github.com/jeroenpardon/sui).

## License

This software is released under the MIT license.
```
Copyright (c) 2020-2026 Luke Rogers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
