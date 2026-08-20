import requests
BASE='http://127.0.0.1:5000/api'
login={'email':'gov.admin@example.com','password':'adminpass123'}
resp=requests.post(BASE+'/auth/login',json=login,timeout=10)
resp.raise_for_status()
token=resp.json().get('token')
headers={'Authorization':f'Bearer {token}'}
ra=requests.get(BASE+'/analytics/overview', headers=headers, timeout=10)
print(ra.status_code)
print(ra.json())
