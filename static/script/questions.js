let currentQuestions = [];
//مصف الأسئلة الحالي اللي راح نستخدمه لعرض الأسئلة في صفحة الاختبار
let currentIndex = 0;
//المتغير اللي راح يخزن رقم السؤال الحالي اللي المستخدم يجاوب عليه
let score = 0;
//المتغير اللي راح يخزن عدد الإجابات الصحيحة اللي المستخدم جاوب عليها

document.addEventListener('DOMContentLoaded', async () => {
    //ايفينت ينتظر DOM يكون جاهز قبل ما ينفذ الكود اللي بداخله
    //ماهو DOM?
    //DOM هو اختصار ل Document Object Model 
    // هو عبارة عن تمثيل هيكلي لصفحة الويب يتيح للجافا سكريبت التفاعل مع عناصر الصفحة وتعديلها بشكل ديناميكي
    //ببساطة، هو الجسر بين الكود البرمجي (جافا سكريبت) والمحتوى اللي بنشوفه على الصفحة (HTML/CSS)
    //نستخدم دالة async هنا لأننا راح نستخدم await داخلها لانتظار الرد من السيرفر عند جلب الأسئلة
    const text = localStorage.getItem('originalText');
    //الحصول على النص الأصلي من التخزين المحلي للمتصفح اللي تم تخزينه بعد رفع الملف في صفحة الملخص
    const type = localStorage.getItem('quizType') || 'MCQ';
    //الحصول على نوع الاختبار من التخزين المحلي للمتصفح، وإذا لم يكن موجودًا، يتم تعيينه إلى 'MCQ' كقيمة افتراضية
    const count = localStorage.getItem('quizCount') || 10;
    //الحصول على عدد الأسئلة من التخزين المحلي للمتصفح، وإذا لم يكن موجودًا، يتم تعيينه إلى 10 كقيمة افتراضية
    const language = localStorage.getItem('language') || 'ar';
    //الحصول على اللغة من التخزين المحلي للمتصفح، وإذا لم يكن موجودًا، يتم تعيينه إلى 'ar' (العربية) كقيمة افتراضية

    if (!text) {
        window.location.href = "/upload-page";
        return;
        //التحقق مما إذا كان هناك نص أصلي موجود في التخزين المحلي، وإذا لم يكن موجودًا، يتم إعادة توجيه المستخدم إلى صفحة الرفع لرفع ملف PDF أولاً
        
    }

    const savedProgress = JSON.parse(localStorage.getItem('quizProgress'));
    // 1. localStorage.getItem: نجيب البيانات المخزنة من ذاكرة المتصفح (ترجع لنا كنص String)
    // 2. JSON.parse: بنحول النص هذا لـ Object حقيقي عشان نقدر نستخدم بياناته برمجياً
    // 3. savedProgress: المتغير اللي راح يخزن التقدم المحفوظ (رقم السؤال الحالي والنتيجة) إذا كان موجودًا في التخزين المحلي

    if (savedProgress) {
        currentIndex = savedProgress.currentIndex || 0;
        //الحصول على رقم السؤال الحالي من التقدم المحفوظ، وإذا لم يكن موجودًا، يتم تعيينه إلى 0 كقيمة افتراضية
        score = savedProgress.score || 0;
        //الحصول على النتيجة الحالية من التقدم المحفوظ، وإذا لم يكن موجودًا، يتم تعيينه إلى 0 كقيمة افتراضية
    }
    const savedQuestions = localStorage.getItem('savedQuestions');
    //LocalStorage.getItem('savedQuestions')
    //هو باختصار شديد طريقة لجلب البيانات المخزنة في المتصفح تحت المفتاح 'savedQuestions'، اللي من المفترض أنه يحتوي على الأسئلة اللي تم توليدها سابقًا من السيرفر

    if (savedQuestions) {
        currentQuestions = JSON.parse(savedQuestions);
        //اذا كان هناك أسئلة محفوظة في التخزين المحلي، يتم تحويلها من نص JSON إلى كائن جافا سكريبت وتخزينها في المتغير currentQuestions لاستخدامها في عرض الأسئلة
        showQuestion();
        //استدعاء دالة showQuestion لعرض السؤال الحالي بناءً على التقدم المحفوظ والأسئلة المخزنة
        return;
    }

    try {
        const response = await fetch('/get-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            //hearders
            //هي معلومات إضافية نرسلها مع الطلب للسيرفر عشان يعرف نوع البيانات اللي راح يستقبلها
            body: JSON.stringify({
                text: text,
                type: type,
                count: count,
                language: language
            })
            //هذه هنا البيانات اللي راح نرسلها للسيرفر في جسم الطلب (body) بعد تحويلها إلى نص JSON باستخدام JSON.stringify
            //ببساطة، نحن نرسل النص الأصلي، نوع الاختبار، عدد الأسئلة، واللغة إلى السيرفر لاجل يولد لنا الأسئلة بناءً على هذه المعطيات
        });

        if (response.ok) {
            currentQuestions = await response.json();

            if (currentQuestions.length > 0) {
                localStorage.setItem('savedQuestions', JSON.stringify(currentQuestions));
                //savedQuestions: هو المفتاح اللي راح نخزن فيه الأسئلة اللي استلمناها من السيرفر في التخزين المحلي للمتصفp
                //JSON.stringify(currentQuestions): ببساطة، نحول الأسئلة اللي استلمناها من السيرفر إلى نص JSON عشان نقدر نخزنه في التخزين المحلي
                showQuestion();
                //استدعاء دالة showQuestion لعرض السؤال الأول بعد ما استلمنا الأسئلة من السيرفر وخزناها في التخزين المحلي
            } else {
                document.getElementById('quiz-title').innerText = "لم يتم توليد أسئلة كافية";
            }
        } else {
            document.getElementById('quiz-title').innerText = "خطأ في تحميل الأسئلة";
        }
    } catch (error) {
        document.getElementById('quiz-title').innerText = "السيرفر غير متصل";
    }
});

function showQuestion() {
    //هذه الدالة مسؤولة عن عرض السؤال الحالي بناءً على المتغير currentIndex والأسئلة المخزنة في currentQuestions
    if (currentIndex >= currentQuestions.length) {
        showFinalResult();
        //اذا كانت السؤال الحالية اكبر من عدد الأسئلة، يتم استدعاء دالة showFinalResult لعرض نتيجة الاختبار
        return;
    }

    const q = currentQuestions[currentIndex];

    const quizTitle = document.getElementById('quiz-title');
    const progressText = document.getElementById('progress-text');
    const questionText = document.getElementById('question-text');
    const container = document.getElementById('options-container');
    const nextBtn = document.getElementById('next-btn');

    quizTitle.innerText = "اختبر نفسك";
    progressText.innerText = `السؤال ${currentIndex + 1} من ${currentQuestions.length}`;
    questionText.innerText = q.question;

    container.innerHTML = "";
    nextBtn.style.display = "none";

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(btn, opt, q.answer);
        container.appendChild(btn);
    });
}

function checkAnswer(btn, selected, correct) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    if (selected === correct) {
        btn.classList.add('correct');
        score++;
    } else {
        btn.classList.add('wrong');
        buttons.forEach(b => {
            if (b.innerText === correct) b.classList.add('correct');
        });
    }

    localStorage.setItem('quizProgress', JSON.stringify({
        currentIndex,
        score
    }));

    document.getElementById('next-btn').style.display = "block";
}

document.getElementById('next-btn').onclick = () => {
    currentIndex++;

    localStorage.setItem('quizProgress', JSON.stringify({
        currentIndex,
        score
    }));

    showQuestion();
};

function showFinalResult() {
    document.getElementById('quiz-container').style.display = "none";
    document.getElementById('result-container').style.display = "block";

    document.getElementById('score-display').innerText = `${score} / ${currentQuestions.length}`;
    const feedback = document.getElementById('result-feedback');
    const percentage = (score / currentQuestions.length) * 100;

    if (percentage >= 80) {
        feedback.innerText = "أداء ممتاز! لقد استوعبت المحتوى بشكل رائع.";
    } else if (percentage >= 50) {
        feedback.innerText = "أداء جيد، يمكنك مراجعة الملخص مرة أخرى لتحسين نتيجتك.";
    } else {
        feedback.innerText = "تحتاج لمراجعة المحتوى بشكل أعمق، لا بأس بالمحاولة مرة أخرى.";
    }
}

document.getElementById('new-questions-btn').onclick = () => {
    localStorage.removeItem('savedQuestions');
    localStorage.removeItem('quizProgress');
    location.reload();
};