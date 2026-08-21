import requests
BASE='http://127.0.0.1:5000/api'
login={'email':'gov.admin@example.com','password':'adminpass123'}
resp=requests.post(BASE+'/auth/login',json=login,timeout=10)
resp.raise_for_status()
token=resp.json().get('token')
print('token', bool(token))
headers={'Authorization':f'Bearer {token}'}
rf=requests.get(BASE+'/feedback', headers=headers, timeout=10)
print(rf.status_code)
print(rf.json())
rf2=requests.get(BASE+'/feedback/internship/6a85d36b2afa181fe3f540c6', headers=headers, timeout=10)
print(rf2.status_code)
print(rf2.json())
