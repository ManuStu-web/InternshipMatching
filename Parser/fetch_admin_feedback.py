import requests

BASE = 'http://127.0.0.1:5000/api'
# Using government/admin credentials provided by user
admin_creds = {'email': 'govt@gmail.com', 'password': '123456'}

try:
    resp = requests.post(BASE + '/auth/login', json=admin_creds, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    token = data.get('token')
    if not token:
        print('Login succeeded but no token found in response:', data)
    else:
        print('Obtained token: (redacted)')
        headers = {'Authorization': f'Bearer {token}'}
        r = requests.get(BASE + '/feedback', headers=headers, timeout=10)
        print('Feedback fetch status:', r.status_code)
        try:
            print(r.json())
        except Exception:
            print('Response text:', r.text)
except requests.exceptions.RequestException as e:
    print('Request failed:', str(e))
