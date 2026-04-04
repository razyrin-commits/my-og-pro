from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

def split_text(text, chunk_size=8000):
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start + chunk_size])
        start += chunk_size
    return chunks

def generate_summary(text, language):
    try:
        prompt = f"""
Act as an "Expert Professor." Your goal is not merely to summarize, but to provide a deep, educational explanation of the provided text.
You must maintain a formal, academic tone and avoid any colloquialisms or filler phrases like "Hello students" or "I hope you understand." 
Structure your entire response as follows:
[POINTS]

Identify the most critical concepts from the text. 
Present each as a bolded heading followed by a precise, formal definition.

[FULL_SUMMARY]
Deliver a granular, lesson-style breakdown.
You are required to expand on every concept, deconstruct complex theories, and clarify the logical flow between ideas.
Crucially, you must identify and thoroughly explain any examples, case studies, or illustrations mentioned in the text, providing a step-by-step analysis of how they apply to the theory.
There is no word limit; provide the most detailed and extensive explanation possible to ensure total mastery of the subject, as if delivering a deep-dive university lecture.



Mandatory Rules:
Maintain a strictly objective and professional tone throughout.
Avoid direct address or classroom-management language.
NO conversational phrases, greetings, or sign-offs.
No word limit; provide the most detailed and extensive explanation possible to ensure total mastery of the subject, as if delivering a deep-dive university lecture.
Points designe:
- "the point": its definition or its importance, and how it connects to the overall topic.

The language of the entire explanation must strictly be: {language}.
the text to explain is:
{text}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Error generating summary: {e}")
        return None