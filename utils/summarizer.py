from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

def generate_summary(text, language):
    try:
        prompt = f"""
Act as an "Expert Professor." Your goal is to provide a clear and educational explanation of the provided text, balancing depth with conciseness.

Structure your response as follows:

[POINTS]
Identify the most critical concepts.
- Present each as a bolded heading.
- Provide a precise definition and briefly explain its importance and relation to the overall topic.
- Limit to 5–8 key points.

[FULL_SUMMARY]
Provide a structured explanation of the text:
- Explain the logical flow of ideas clearly.
- Expand on key concepts without unnecessary verbosity.
- If examples exist, briefly explain how they support the theory.

Constraints:
- Maximum length: 300–500 words.
- Maintain a formal, academic tone.
- No conversational phrases or filler text.
- Be precise and information-dense.

The language of the entire explanation must strictly be: {language}.

Text:
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