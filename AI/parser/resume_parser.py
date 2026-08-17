from io import BytesIO
from pypdf import PdfReader
import re


SKILLS = [
    "Java",
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "MySQL",
    "SQL",
    "HTML",
    "CSS",
    "Spring Boot",
    "Git",
    "Docker",
    "AWS",
    "Machine Learning",
    "TensorFlow",
    "C++",
    "C"
]


def extract_text(file_content):
    pdf = PdfReader(BytesIO(file_content))

    text = ""

    for page in pdf.pages:
        extracted_text = page.extract_text()

        if extracted_text:
            text += extracted_text + "\n"

    return text


def extract_skills(text):
    text_lower = text.lower()

    found_skills = []

    for skill in SKILLS:
        if skill.lower() in text_lower:
            found_skills.append(skill)

    return found_skills


def extract_experience(text):
    pattern = r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)"

    matches = re.findall(pattern, text.lower())

    if not matches:
        return 0

    return max(float(value) for value in matches)


def extract_education(text):
    text_lower = text.lower()

    education = {
        "degree": None,
        "branch": None,
        "graduationYear": None
    }

    if "b.tech" in text_lower or "btech" in text_lower:
        education["degree"] = "B.Tech"
    elif "b.e" in text_lower or "be " in text_lower:
        education["degree"] = "B.E"
    elif "m.tech" in text_lower:
        education["degree"] = "M.Tech"
    elif "mca" in text_lower:
        education["degree"] = "MCA"

    if "computer science" in text_lower or "cse" in text_lower:
        education["branch"] = "Computer Science"

    years = re.findall(r"\b20\d{2}\b", text)

    if years:
        education["graduationYear"] = int(years[-1])

    return education


def parse_resume(file_content):

    text = extract_text(file_content)

    return {
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience": extract_experience(text),
        "rawText": text
    }