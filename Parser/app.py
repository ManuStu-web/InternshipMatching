from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io
from pdfminer.high_level import extract_text
import re

app = FastAPI(title="SIH25033 Resume Parser")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

COMMON_SKILLS = [
    "python","java","javascript","react","node","express","django","flask",
    "sql","mysql","postgresql","mongodb","aws","azure","docker","kubernetes",
    "git","html","css","typescript","c","c++","c#","php","ruby","rust",
    "machine learning","data science","nlp","pytorch","tensorflow","keras",
    "excel","power bi","tableau","linux","bash"
]

DEGREE_KEYWORDS = [
    "bachelor","b.tech","b.e","bsc","bachelor of","master","m.tech","m.e","msc","mba","phd","high school","secondary"
]


def extract_text_from_pdf_bytes(data: bytes) -> str:
    try:
        text = extract_text(io.BytesIO(data))
        return text
    except Exception as e:
        raise


def find_skills(text: str):
    text_l = text.lower()
    found = set()
    for skill in COMMON_SKILLS:
        if skill in text_l:
            found.add(skill.title())
    # also catch words like "react.js" or "node.js"
    extras = re.findall(r"\b([A-Za-z#+\.]{2,})\b", text)
    # keep small, but do not overdetect
    return list(sorted(found))


def find_education(text: str):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    ed = []
    for i, line in enumerate(lines):
        ll = line.lower()
        for kw in DEGREE_KEYWORDS:
            if kw in ll:
                # capture line and maybe next line
                entry = line
                if i + 1 < len(lines) and len(lines[i + 1]) < 80:
                    entry = entry + "; " + lines[i + 1]
                ed.append(entry)
                break
    # dedupe
    unique = []
    for e in ed:
        if e not in unique:
            unique.append(e)
    return unique


def find_experience(text: str):
    # Very simple heuristic: look for sections named Experience or Work Experience and collect next few lines
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    exp = []
    for i, line in enumerate(lines):
        if re.search(r"experience|work experience|employment|professional experience", line, re.I):
            # collect up to next 10 lines as possible entries
            for j in range(i+1, min(i+11, len(lines))):
                ln = lines[j]
                if len(ln) < 200:
                    exp.append(ln)
            break
    # fallback: look for patterns like "X years" or date ranges
    if not exp:
        matches = re.findall(r"([A-Z][a-zA-Z& ]{2,40})\s+\-\s+([A-Z][a-zA-Z& ]{2,40})", text)
        for m in matches:
            exp.append(" - ".join(m))
    # dedupe
    unique = []
    for e in exp:
        if e not in unique:
            unique.append(e)
    return unique


@app.post('/parse-resume')
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail='Only PDF resumes are supported')
    content = await file.read()
    try:
        text = extract_text_from_pdf_bytes(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail='Failed to extract text from PDF')

    skills = find_skills(text)
    education = find_education(text)
    experience = find_experience(text)

    return JSONResponse({
        'skills': skills,
        'education': education,
        'experience': experience,
    })
