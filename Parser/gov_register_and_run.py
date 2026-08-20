import requests
BASE='http://127.0.0.1:5000/api'
reg={'name':'Gov Admin','email':'gov.admin@example.com','password':'adminpass123','department':'PMIS','role':'admin'}
try:
    r=requests.post(BASE+'/auth/register',json=reg,timeout=10)
    print('reg', r.status_code, r.json())
except Exception as e:
    print('reg error', e)

login={'email':'gov.admin@example.com','password':'adminpass123'}
r=requests.post(BASE+'/auth/login',json=login,timeout=10)
print('login', r.status_code, r.json())
token=r.json().get('token')
print('got token', bool(token))
# run allocation for internship 6a85d36b2afa181fe3f540c6
internship_id='6a85d36b2afa181fe3f540c6'
headers={'Authorization':f'Bearer {token}'}
r2=requests.post(f'{BASE}/allocation/run/{internship_id}', headers=headers, timeout=30)
print('run allocation', r2.status_code, r2.text)
