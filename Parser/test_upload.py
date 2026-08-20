import requests
url = 'http://127.0.0.1:8000/parse-resume'
files = {'file': open('D:\\SIH2026\\InternshipMatching.worktrees\\sih25033-frontend-prototype-setup\\Backend\\uploads\\1787235897439-sample_resume.pdf','rb')}
resp = requests.post(url, files=files, timeout=30)
print(resp.status_code)
print(resp.text)
