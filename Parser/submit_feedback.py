import requests
BASE='http://127.0.0.1:5000/api'
login={'email':'test.user@example.com','password':'testpass123'}
resp=requests.post(BASE+'/candidates/login',json=login,timeout=10)
resp.raise_for_status()
token=resp.json().get('token')
print('token present', bool(token))
# submit feedback for internship 6a85d36b2afa181fe3f540c6
payload={'internshipId':'6a85d36b2afa181fe3f540c6','rating':4,'comment':'Great internship experience'}
headers={'Authorization':f'Bearer {token}'}
r=requests.post(BASE+'/feedback',json=payload,headers=headers,timeout=10)
print(r.status_code)
print(r.json())
