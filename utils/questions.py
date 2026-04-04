from google import genai
import os
import json
from dotenv import load_dotenv
import re

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

def generate_questions(text, quiz_type, count, language):
    try:
        if quiz_type == 'MCQ' :
            type_instruction = "Multiple Choice Questions (MCQ) with 4 options"
        else:
            type_instruction = "True/False questions"

        prompt = f"""
You are a STRICT and HIGH-LEVEL examiner.

Generate exactly {count} {type_instruction} based ONLY on the provided text.

Rules:
- Questions must test understanding, not memorization
- Avoid obvious or trivial questions
- Make questions slightly challenging
- Avoid repeating ideas
- For MCQ: all options must be plausible
- Do NOT make the correct answer obvious
- For True/False: avoid very obvious statements

Return ONLY valid JSON. ONLY (JSON)
Return ONLY JSON in this format:
[
  {{
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": "..."
  }}
]
Language: {language}
Text: {text}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents = prompt,

            config={'response_mime_type': 'application/json'}
        )
        clran_json = re.sub(r'```json', '', response.text).strip()
        return json.loads(clran_json)
    except Exception as e:
        print(f"AI Error: {e}")
        return None