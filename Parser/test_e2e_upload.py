import requests

BASE = 'http://127.0.0.1:5000/api'
login = {'email':'test.user@example.com','password':'testpass123'}
print('Logging in')
resp = requests.post(f'{BASE}/candidates/login', json=login, timeout=10)
resp.raise_for_status()
token = resp.json().get('token')
print('Token:', bool(token))
files = {'resume': ('sample_resume.pdf', open('D:\\SIH2026\\InternshipMatching.worktrees\\sih25033-frontend-prototype-setup\\Backend\\uploads\\1787235897439-sample_resume.pdf','rb'), 'application/pdf')}
headers = {'Authorization': f'Bearer {token}'}
print('Uploading resume')
resp2 = requests.post(f'{BASE}/candidates/resume', files=files, headers=headers, timeout=30)
print(resp2.status_code)
print(resp2.text)
