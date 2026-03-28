import urllib.request, urllib.parse
import json

boundary = 'wL36Yn8afVp8Ag7AmP8qZ0SA4n1v9T'
body = (
    '--' + boundary + '\r\n'
    'Content-Disposition: form-data; name="title"\r\n\r\n'
    'test\r\n'
    '--' + boundary + '\r\n'
    'Content-Disposition: form-data; name="platforms"\r\n\r\n'
    'youtube\r\n'
    '--' + boundary + '\r\n'
    'Content-Disposition: form-data; name="video"; filename="t.mp4"\r\n'
    'Content-Type: video/mp4\r\n\r\n'
    'a\r\n'
    '--' + boundary + '--\r\n'
)

req = urllib.request.Request(
    'http://localhost:8000/api/posts',
    data=body.encode('utf-8'),
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'},
    method='POST'
)

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode('utf-8'))
