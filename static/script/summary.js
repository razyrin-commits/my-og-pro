document.addEventListener('DOMContentLoaded', () => {
    //ايفينت ينتظر DOM يكون جاهز قبل ما ينفذ الكود اللي بداخله
    //ماهو DOM?
    //DOM هو اختصار ل Document Object Model 
    // هو عبارة عن تمثيل هيكلي لصفحة الويب يتيح للجافا سكريبت التفاعل مع عناصر الصفحة وتعديلها بشكل ديناميكي
    //ببساطة، هو الجسر بين الكود البرمجي (جافا سكريبت) والمحتوى اللي بنشوفه على الصفحة (HTML/CSS)
    const rawData = localStorage.getItem('pdfSummary');
    const pointsList = document.getElementById('keyPoints');
    const fullSummaryDiv = document.getElementById('fullSummary');
    //الحصول على الملخص الخام من التخزين المحلي والعناصر التي سيتم عرض البيانات فيها

    if (!rawData) {
        console.error("No summary found!");
        fullSummaryDiv.innerHTML = "<p>عذراً، لم يتم العثور على ملخص. يرجى رفع الملف مجدداً.</p>";
        return;
    }
    //التحقق مما إذا كان هناك ملخص موجود في التخزين المحلي، وإذا لم يكن موجودًا، يتم عرض رسالة خطأ للمستخدم

   
    const pointsPart = rawData.split('[POINTS]')[1]?.split('[FULL_SUMMARY]')[0]?.trim();
    // 1. rawData: هو النص الخام الكبير اللي واصل من السيرفر (الذكاء الاصطناعي)
    // 2. split('[POINTS]')[1]: بنقص النص ونأخذ الجزء اللي "بعد" كلمة [POINTS]
    // 3. split('[FULL_SUMMARY]')[0]: بنقص الجزء الناتج مرة ثانية ونأخذ اللي "قبل" كلمة [FULL_SUMMARY]
    // 4. trim(): بننظف النص من أي فراغات أو سطور زايدة في البداية والنهاية
    // 5. ?.: علامة أمان (Optional Chaining) عشان الكود ما يضرب لو الكلمات هذي مش موجودة
    const summaryPart = rawData.split('[FULL_SUMMARY]')[1]?.trim();
    //تقسيم الملخص الخام إلى جزئين: النقاط الرئيسية والملخص الكامل باستخدام علامات [POINTS] و [FULL_SUMMARY] كفواصل

    
    if (pointsPart) {
        const lines = pointsPart.split('\n').filter(line => line.trim() !== "");
        //تقسيم الجزء الخاص بالنقاط إلى أسطر فردية وتصفية الأسطر الفارغة
        //.filter(line => line.trim() !== "" : بنستخدم هذا الفلتر لاجل نتأكد اننا ما نضيف نقاط فارغة للقائمة
        // يعني لو كان هناك سطر بس فيه فراغات او كان فاضي， ما راح نضيفه للقائمة
        pointsList.innerHTML = ""; 
        //مسح أي نقاط سابقة من القائمة قبل إضافة النقاط الجديدة
        lines.forEach(line => {
            const li = document.createElement('li');
            //إنشاء عنصر قائمة جديد لكل نقطة رئيسية
            const cleanHtml = DOMPurify.sanitize(marked.parse(line.trim()));
            //تنظيف النص من أي محتوى HTML ضار وتحويله من صيغة Markdown إلى HTML آمن
            li.innerHTML = cleanHtml;
            pointsList.appendChild(li);
            //إضافة كل نقطة كعنصر قائمة داخل القائمة المرتبة في صفحة الملخص
        });
    }

   
    if (summaryPart) {
        fullSummaryDiv.innerHTML = DOMPurify.sanitize(marked.parse(summaryPart));
        //عرض الملخص الكامل داخل العنصر 'fullSummary' مع دعم تنسيق Markdown
    } else if (!pointsPart && rawData) {
       
        fullSummaryDiv.innerHTML = DOMPurify.sanitize(marked.parse(rawData));
        //إذا لم يكن هناك نقاط رئيسية ولكن كان هناك ملخص خام، يتم عرض الملخص الخام بالكامل مع دعم تنسيق Markdown
    }
});
//هذا الايفنت كله مهمته:
//1- قراءة الملخص الخام من التخزين المحلي
//2- تقسيم الملخص إلى جزئين: النقاط الرئيسية والملخص الكامل
//3- عرض النقاط الرئيسية في قائمة مرتبة داخل العنصر 'keyPoints'
//4- عرض الملخص الكامل داخل العنصر 'fullSummary' مع دعم تنسيق Markdown


document.getElementById('startQuizBtn').addEventListener('click', () => {
    const count = document.querySelector('input[name="questions"]:checked').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    //الحصول على عدد الأسئلة ونوع الاختبار الذي اختاره المستخدم من الخيارات المتاحة في صفحة الملخص

    
    localStorage.setItem('quizCount', count);
    localStorage.setItem('quizType', type);
    //تخزين عدد الأسئلة ونوع الاختبار في التخزين المحلي للمتصفح تحت المفاتيح 'quizCount' و 'quizType' على التوالي
    
    window.location.href = "/questions-page";
    //توجيه المستخدم إلى صفحة الأسئلة لبدء الاختبار
});