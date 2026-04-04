from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from google import genai
from utils.pdf_reader import extract_text_from_pdf
from utils.summarizer import generate_summary
from utils.validation import validate_pdf_content
from utils.questions import generate_questions

app = Flask(__name__)
# هذا السطر يضبط إعدادات Flask لعدم تحويل الأحرف غير ASCII إلى Unicode escape sequences في JSON responses، مما يسمح بعرض النصوص باللغة العربية بشكل صحيح في الواجهة الأمامية.
app.config['JSON_AS_ASCII'] = False
#مهمة هذا السطر هو تمكين CORS للسماح بالطلبات من أي مصدر، مما يسهل التواصل بين الواجهة الأمامية والخلفية في تطبيق الويب.

CORS(app, resources={r"/*": {"origins": "*"}})

# إعدادات المجلد لتحميل الملفات
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# هذا السطر يحدد مسار المجلد الذي سيتم فيه تخزين الملفات المرفوعة من قبل المستخدمين. يتم إنشاء هذا المجلد إذا لم يكن موجودًا بالفعل، مما يضمن أن التطبيق يمكنه التعامل مع عمليات تحميل الملفات بشكل صحيح.
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
# هذا السطر يضبط إعدادات Flask لتحديد المجلد الذي سيتم فيه تخزين الملفات المرفوعة من قبل المستخدمين. يتم استخدام هذا المسار لاحقًا في وظيفة تحميل الملفات لضمان حفظ الملفات في المكان الصحيح.
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER 

#هذول السطرين يتحققون إذا كان المجلد المحدد لتخزين الملفات المرفوعة موجودًا بالفعل. إذا لم يكن موجودًا، يقوم السطر الأول بإنشاء هذا المجلد باستخدام os.makedirs(). هذا يضمن أن التطبيق يمكنه التعامل مع عمليات تحميل الملفات بشكل صحيح دون مواجهة أخطاء بسبب عدم وجود المجلد.
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('main.html')

@app.route('/upload-page')
def upload_page():
    return render_template('upload.html')

@app.route('/summary-page')
def summary_page():
    return render_template('summary.html')

@app.route('/questions-page')
def questions_page():
    return render_template('questions.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'pdfFile' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['pdfFile']
    language = request.form.get('language', 'ar')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    try:
        extracted_text = extract_text_from_pdf(file_path)

        if not extracted_text:
            return jsonify({'error': 'Failed to extract text from PDF'}), 500

        if not validate_pdf_content(extracted_text):
            return jsonify({'error': 'Invalid PDF content'}), 500

        try:
            summary = generate_summary(extracted_text, language)
        except Exception as e:
            print(f"AI Error: {e}")
            summary = None

        if summary:
            return jsonify({
                'message': 'File uploaded and summarized successfully',
                'filename': file.filename,
                'language': language,
                'summary': summary,
                'original_text': extracted_text
            }), 200

        return jsonify({'error': 'Failed to generate summary'}), 500

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
    
@app.route('/get-questions', methods=['POST'])
def get_questions_route():
    try:
        data = request.get_json()
        text = data.get('text')
        q_type = data.get('type')
        count = data.get('count')
        lang = data.get('language')
        
        questions = generate_questions(text, q_type, count, lang)
        
        if questions:
            return jsonify(questions), 200
        else:
            return jsonify({"error": "No questions generated"}), 500
    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)