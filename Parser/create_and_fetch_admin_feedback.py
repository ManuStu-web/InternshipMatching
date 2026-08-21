import requests

BASE = 'http://127.0.0.1:5000/api'
admin = {
    'name': 'Admin',
    'email': 'govt@gmail.com',
    'password': '123456',
    'department': 'Testing',
    'role': 'admin'
}

try:
    # Try to register (ignore 400 if already exists)
    reg = requests.post(BASE + '/auth/register', json=admin, timeout=10)
    print('Register status:', reg.status_code)
    try:
        print('Register response:', reg.json())
    except Exception:
        print('Register response text:', reg.text)

    # Login
    creds = {'email': admin['email'], 'password': admin['password']}
    resp = requests.post(BASE + '/auth/login', json=creds, timeout=10)
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
