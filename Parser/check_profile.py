import requests
BASE='http://127.0.0.1:5000/api'
login={'email':'test.user@example.com','password':'testpass123'}
resp=requests.post(BASE+'/candidates/login',json=login,timeout=10)
resp.raise_for_status()
token=resp.json()['token']
profile=requests.get(BASE+'/candidates/me',headers={'Authorization':f'Bearer {token}'},timeout=10)
print(profile.status_code)
print(profile.json())
