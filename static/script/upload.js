const fileInput = document.getElementById('pdfFile');
const statusLabel = document.getElementById('status');
const submitButton = document.getElementById('submit-btn');
//هذه هي المتغيرات التي سيتم استعمالها لاحقا

async function sendToBackend() {
    //استخدام الدالة غير المتزامنة لارسال البيانات للسيرفر وانتظار الرد
    if (!fileInput.files || fileInput.files[0] === undefined) {
        alert("يرجى اختيار ملف PDF أولاً");
        return;
    }
    //التحقق من أن المستخدم قد اختار ملفًا قبل المتابعة

    localStorage.clear();
    //مسح أي بيانات سابقة في التخزين المحلي لضمان عدم وجود تعارضات

    const formData = new FormData();
    //انشاء الكائن خاص لارسال الملف اللى السيرفر
    formData.append("pdfFile", fileInput.files[0]);
    //اضافة الملف الى البيانات
    //pdfFile هو الاسم الذي سيرسله الجافا سكريبت للسيرفر ليتعرف عليه
    //fileInput.files[0] هو الملف الذي اختاره المستخدم
    
    const selectedLang = document.querySelector('input[name="lang"]:checked').value;
    //الحصول على اللغة المختارة
    formData.append("language", selectedLang);
    //اضافة اللغة الى البيانات


    submitButton.innerText = "جاري الارسال...انتظر قليلاً";
    //تغيير نص الزر
    submitButton.disabled = true;
    //تعطيل الزر لمنع النقر المتكرر
    submitButton.style.opacity = "0.7";
    //يجعله باهت

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        //ارسال  طلب الى اليرفر ويعطي مع الطلب البيانات التي تم انشاؤها بواسطة formData
        ///upload هو المسار الذي سيرسله الجافا سكريبت للسيرفر ليتعرف على نوع الطلب
        //method: 'POST' يعني أن هذا الطلب من نوع POST والذي يستخدم عادة لإرسال البيانات إلى السيرفر

        const data = await response.json();
        //قراءة البيانات المرسلة من السيرفر وتحويلها من صيغة JSON إلى كائن جافا سكريبت

        if (response.ok) {
        //إذا كان الرد من السيرفر يشير إلى نجاح العملية (status code 200-299)
            localStorage.setItem('pdfSummary', data.summary);
            //تخزين الملخص او الشرح الذي استلمه JS من السيرفر في التخزين المحلي للمتصفح تحت المفتاح 'pdfSummary'
            localStorage.setItem('originalText', data.original_text);
            //تخزين النص الأصلي الذي استلمه JS من السيرفر في التخزين المحلي للمتصفح تحت المفتاح 'originalText'
            localStorage.setItem('language', selectedLang);
            //تخزين اللغة المختارة في التخزين المحلي للمتصفح تحت المفتاح 'language'
            
            window.location.href = "/summary-page";
            //توجيه المستخدم إلى صفحة الملخص لعرض النتائج
        } else {
            alert("خطأ: " + (data.error || "فشل رفع الملف"));
            resetButton();
        }
    } catch (error) {
        console.error("Connection Error:", error);
        alert("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
        resetButton();
    }
}
//الدالة resetButton تعيد الزر إلى حالته الأصلية في حالة حدوث خطأ أثناء الاتصال بالسيرفر أو إذا كان الرد غير ناجح

function resetButton() {
    submitButton.innerText = "بدء عملية التلخيص";
    submitButton.disabled = false;
    submitButton.style.opacity = "1";
}
//إعادة تعيين نص الزر، تمكينه مرة أخرى، وإعادة تعيين شفافيته إلى الوضع الطبيعي
/* قد تسال كيف تم تعريف الدالة بعد استدعائها؟
تم ذلك ببسالطة بسبب خاصية Hoisting ,والذي يعمل فقط مع دالة
Function Declaration
ولا يعمل مع دالة Function Expression او Arrow Function */


submitButton.addEventListener('click', sendToBackend);
//اضافة ايفينت للزر بحيث عند النقر عليه يتم استدعاء الدالة sendToBackend لبدء عملية الرفع والتلخيص

fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) {
        statusLabel.innerText = "تم اختيار: " + fileInput.files[0].name;
        statusLabel.style.color = "#27ae60";
        statusLabel.style.fontWeight = "bold";
    }
});
//تغيير حالة مكان وضع الملف