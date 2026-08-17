from fastapi import FastAPI, UploadFile, File
from parser.resume_parser import parse_resume

app = FastAPI()


@app.get("/")
def root():
    return {
        "message": "Resume Parser API is running"
    }


@app.post("/parse-resume")
async def parse_resume_endpoint(
    file: UploadFile = File(...)
):
    content = await file.read()

    result = parse_resume(content)

    return result