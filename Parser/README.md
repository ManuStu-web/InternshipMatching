SIH25033 Resume Parser

This lightweight FastAPI parser extracts text from PDF resumes and returns structured JSON with skills, education and experience.

Requirements:
- fastapi
- uvicorn
- pdfminer.six
- python-multipart

To run:

pip install -r requirements.txt
python -m uvicorn Parser.app:app --host 127.0.0.1 --port 8000
