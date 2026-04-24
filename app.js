let quizzes = [];
let questions = [];
let current = 0;
let score = 0;
let selected = null;
let answered = false;

const appContainer = document.getElementById("app");

// ---------------- LOAD DASHBOARD ----------------
async function loadDashboard() {
    const res = await fetch("quizzes.json");
    quizzes = await res.json();
    renderDashboard();
}

// ---------------- DASHBOARD UI ----------------
function renderDashboard() {
    appContainer.innerHTML = `
        <div class="bg-emerald-600 p-8 text-white text-center">
            <h1 class="text-3xl font-bold">Ərəb dili 101 - Testlər - Əsas səhifə</h1>
            <p class="text-emerald-100">Bir test seç</p>
        </div>

        <div class="p-6 grid gap-4">
            ${quizzes.map(q => `
                <div class="border rounded-2xl p-5 shadow hover:shadow-lg transition cursor-pointer"
                     onclick="startQuiz('${q.id}')">

                    <h2 class="text-xl font-bold">${q.title}</h2>
                    <p class="text-slate-500">${q.description}</p>

                    <div class="mt-3 text-emerald-600 font-semibold">
                        Başla →
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

// ---------------- START QUIZ ----------------
async function startQuiz(id) {
    try {
        const res = await fetch(`quizzes/${id}.json`);
        const data = await res.json();

        // NEW FORMAT ONLY
        questions = data.questions;

        current = 0;
        score = 0;
        selected = null;
        answered = false;

        renderQuestion();

    } catch (error) {
        console.error(error);

        appContainer.innerHTML = `
            <div class="p-10 text-center">
                <h1 class="text-2xl font-bold text-red-500 mb-4">
                    Quiz yüklənmədi
                </h1>
                <p class="text-slate-500">
                    ${id}.json faylında problem var
                </p>

                <button onclick="loadDashboard()"
                    class="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl">
                    Geri qayıt
                </button>
            </div>
        `;
    }
}

// ---------------- QUESTION UI (YOUR NICE UI RESTORED) ----------------
function renderQuestion() {
    const q = questions[current];
    const progress = ((current + 1) / questions.length) * 100;

    let optionsHTML = q.options.map((opt, idx) => {

        let classes = "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50";

        if (answered) {
            if (opt === q.correct_answer) {
                classes = "border-emerald-500 bg-emerald-50";
            } else if (idx === selected) {
                classes = "border-red-500 bg-red-50";
            } else {
                classes = "opacity-40";
            }
        }

        return `
            <button onclick="selectAnswer(${idx})"
                class="w-full p-5 flex flex-row-reverse items-center justify-between rounded-2xl border-2 transition-all mb-4 ${classes}"
                ${answered ? "disabled" : ""}>

                <span
  class="text-xl ${/[\u0600-\u06FF]/.test(opt) ? 'font-arabic text-right' : 'text-left'} w-full"
  dir="${/[\u0600-\u06FF]/.test(opt) ? 'rtl' : 'ltr'}"
  style="unicode-bidi: isolate;"
>
  ${opt}
</span>

            </button>
        `;
    }).join("");

    appContainer.innerHTML = `
        <div class="bg-emerald-600 p-6 text-white flex items-center justify-between">

    <button onclick="loadDashboard()"
        class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold">
        ← Əsas səhifə
    </button>

    <h1 class="text-lg font-bold text-center flex-1">
        Sual ${current + 1} / ${questions.length}
    </h1>

    <div class="w-20"></div> <!-- spacer for balance -->

</div>

        <div class="px-6 pt-4">
            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500" style="width:${progress}%"></div>
            </div>
        </div>

        <div class="p-6 md:p-10">

           <p class="text-xl md:text-2xl font-medium mb-8 text-left leading-relaxed"
   dir="auto"
   style="unicode-bidi: plaintext;">
    ${q.question}
</p>    

            <div>
                ${optionsHTML}
            </div>

            ${answered ? `
                <button onclick="nextQuestion()"
                    class="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">
                    Növbəti
                </button>
            ` : ""}
        </div>
    `;
}
// ---------------- ANSWER ----------------
function selectAnswer(idx) {
    if (answered) return;

    selected = idx;
    answered = true;

    const correct = questions[current].correct_answer;
    const chosen = questions[current].options[idx];

    if (chosen === correct) {
        score++;
    }

    renderQuestion();
}

// ---------------- NEXT ----------------
function nextQuestion() {
    current++;
    selected = null;
    answered = false;

    if (current < questions.length) {
        renderQuestion();
    } else {
        showResult();
    }
}

// ---------------- RESULT ----------------
function showResult() {
    appContainer.innerHTML = `
        <div class="bg-emerald-600 p-8 text-white text-center">
            <h1 class="text-2xl font-bold">Nəticə</h1>
        </div>

        <div class="p-10 text-center">
            <div class="text-6xl font-black text-emerald-600 mb-4">
                ${score} / ${questions.length}
            </div>

            <button onclick="loadDashboard()"
                class="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold">
                Əsas səhifəyə qayıt
            </button>
        </div>
    `;
}

// ---------------- START ----------------
loadDashboard();