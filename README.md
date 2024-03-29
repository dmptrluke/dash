# dash
A sweet and simple Docker dashboard for home server usage.

To run `dash`, you can use the following `docker-compose.yml` file.
```yaml
---
version: "3.8"

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
`dash` is configured using a simple `apps.json` file. An example is included below. Modify the file, and mount it into your container as `/config/apps.json`.
```json
{
  "Watch": [
    {
      "name": "Plex",
      "icon": "mdi-plex",
      "description": "Movies and TV",
      "url": "https://plex.example.com/"
    },
    {
      "name": "Jellyfin",
      "icon": "custom-jellyfin",
      "description": "Movies and TV",
      "url": "https://jf.example.com/"
    }
  ],
  "Home": [
    {
      "name": "Home Assistant",
      "icon": "mdi-home-assistant",
      "description": "Control and Monitor",
      "url": "https://homeassistant.example.com/"
    }
  ]
}
```

This project was derived from [jeroenpardon/sui](https://github.com/jeroenpardon/sui).

## License

This software is released under the MIT license.
```
Copyright (c) 2020-2023 Luke Rogers

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
