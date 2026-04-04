import os

def allowed_file(filename):
    ALLOWED_EXTENTIONS = {'pdf'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENTIONS

def validate_pdf_content(extracted_text):
    if not extracted_text or len(extracted_text.strip()) < 100:
        return False
    return True