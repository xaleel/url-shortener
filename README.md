# url-shortener
REST API - a simple URL shortener microservice made with Express and MongoDB.

## Usage
You can POST a URL to `/api/shorturl` and get a JSON response with original_url and short_url properties.

For example: `{ original_url : 'https://google.com', short_url : 1337}`

Visiting `/api/shorturl/<short_url>` will redirect you to the original URL.
