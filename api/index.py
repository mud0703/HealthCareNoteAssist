import os
from pathlib import Path
from fastapi import FastAPI, Depends  # type: ignore
from fastapi.responses import StreamingResponse  # type: ignore
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials  # type: ignore
from openai import OpenAI  # type: ignore
from pydantic import BaseModel  # type: ignore

# Load .env.local when running locally (Next.js convention; not auto-loaded by uvicorn)
_env_file = Path(__file__).parent.parent / ".env.local"
if _env_file.exists():
    for _line in _env_file.read_text().splitlines():
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _, _v = _line.partition("=")
            os.environ.setdefault(_k.strip(), _v.strip())

app = FastAPI()

clerk_config = ClerkConfig(jwks_url=os.environ["CLERK_JWKS_URL"])
clerk_guard = ClerkHTTPBearer(clerk_config)

SPECIALTY_SYSTEM_PROMPTS: dict[str, str] = {
    "Pediatrics": (
        "You are assisting a pediatrician. Use age-appropriate, family-friendly language "
        "in the patient email. Flag developmental considerations where relevant."
    ),
    "Cardiology": (
        "You are assisting a cardiologist. Emphasise cardiovascular risk factors, medications, "
        "and monitoring in the doctor summary and action checklist."
    ),
    "Psychiatry": (
        "You are assisting a psychiatrist. Use compassionate, destigmatising language. "
        "Include mental health resources in the patient email where appropriate."
    ),
    "Orthopedics": (
        "You are assisting an orthopaedic specialist. Focus on functional limitations, "
        "rehabilitation plans, and mobility goals."
    ),
}

BASE_SYSTEM_PROMPT = """
You are provided with notes written by a doctor from a patient's visit.
Your job is to summarise the visit and prepare communications.
Reply with exactly three sections with these headings (use ###):

### Summary of visit for the doctor's records
### Next steps for the doctor
### Draft of email to patient in patient-friendly language
"""


class Visit(BaseModel):
    patient_name: str
    date_of_visit: str
    notes: str
    specialty: str = "General Practice"


def build_system_prompt(specialty: str) -> str:
    extra = SPECIALTY_SYSTEM_PROMPTS.get(specialty, "")
    return BASE_SYSTEM_PROMPT + ("\n" + extra if extra else "")


def user_prompt_for(visit: Visit) -> str:
    return (
        f"Specialty: {visit.specialty}\n"
        f"Patient Name: {visit.patient_name}\n"
        f"Date of Visit: {visit.date_of_visit}\n"
        f"Notes:\n{visit.notes}"
    )


def event_stream(stream):
    for chunk in stream:
        text = chunk.choices[0].delta.content
        if text:
            lines = text.split("\n")
            for line in lines[:-1]:
                yield f"data: {line}\n\n"
                yield "data:  \n"
            yield f"data: {lines[-1]}\n\n"


@app.post("/api/consultation")
@app.post("/consultation")
def consultation_summary(
    visit: Visit,
    creds: HTTPAuthorizationCredentials = Depends(clerk_guard),
):
    client = OpenAI()
    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": build_system_prompt(visit.specialty)},
            {"role": "user", "content": user_prompt_for(visit)},
        ],
        stream=True,
    )
    return StreamingResponse(event_stream(stream), media_type="text/event-stream")


@app.get("/health")
def health():
    return {"status": "ok"}
