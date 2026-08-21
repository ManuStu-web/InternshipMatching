import requests, glob
BASE='http://127.0.0.1:8000/parse-resume'
files = glob.glob('D:/SIH2026/InternshipMatching.worktrees/sih25033-frontend-prototype-setup/Backend/uploads/*.pdf')
for f in files:
    print('\nFile:', f)
    with open(f,'rb') as fh:
        r = requests.post(BASE, files={'file':('f.pdf', fh, 'application/pdf')}, timeout=30)
        try:
            print(r.status_code, r.json())
        except Exception as e:
            print('error', r.status_code, r.text)
