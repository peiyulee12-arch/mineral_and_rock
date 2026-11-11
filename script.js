// --- 礦物資料庫 ---
const MINERALS = {
    quartz: {
        name: "石英 (Quartz)",
        formula: "SiO₂ - 二氧化矽",
        hardness: 7,
        cleavage: "無解理 (貝殼狀斷口)",
        luster: "玻璃光澤",
        desc: "地殼中最常見的礦物之一，具有六方柱狀結構，端點呈錐狀。純淨時呈無色透明（水晶），硬度極高。",
        tip: "硬度比小刀高，無法被劃傷；敲擊後會產生弧形的「貝殼狀斷口」。",
        color: 0xe0e7ff,
        geometry: "quartz"
    },
    pyrite: {
        name: "黃鐵礦 (Pyrite)",
        formula: "FeS₂ - 二硫化亞鐵",
        hardness: 6.5,
        cleavage: "解理不完全",
        luster: "金屬光澤",
        desc: "俗稱「愚人金」，結晶常呈完美的立方體，晶面上常見平行條紋。具有強烈的金屬光澤。",
        tip: "雖然顏色像黃金，但條痕色為「綠黑色」，且硬度高無法用小刀劃傷。",
        color: 0xeab308,
        geometry: "cube"
    },
    fluorite: {
        name: "螢石 (Fluorite)",
        formula: "CaF₂ - 氟化鈣",
        hardness: 4,
        cleavage: "完全解理 (八面體)",
        luster: "玻璃光澤",
        desc: "晶體常見正八面體或立方體，色彩極為豐富。在紫外線照射下常會發出螢光。",
        tip: "具有 4 組完全解理，受敲擊容易沿著晶面裂開成光滑八面體。",
        color: 0xa855f7,
        geometry: "octahedron"
    },
    calcite: {
        name: "方解石 (Calcite)",
        formula: "CaCO₃ - 碳酸鈣",
        hardness: 3,
        cleavage: "三組完全解理 (菱面體)",
        luster: "玻璃光澤",
        desc: "主要成分為碳酸鈣，具有顯著的雙折射現象。受到敲擊時會裂成稜鏡狀的菱面體碎片。",
        tip: "滴加稀鹽酸會立即劇烈產生二氧化碳氣泡；透視文字時會出現「雙重重影」。",
        color: 0xf1f5f9,
        geometry: "rhombohedron"
    },
    mica: {
        name: "雲母 (Mica)",
        formula: "KAl₂(AlSi₃O₁₀)(OH)₂",
        hardness: 2.5,
        cleavage: "極完全解理 (單向薄片)",
        luster: "珍珠光澤 / 珍珠般片狀",
        desc: "具有層狀矽酸鹽結構，可被非常輕易地剝離成極薄且具彈性的透明薄片。",
        tip: "可以用手指甲輕易劃傷（硬度低於 2.5），且可用手撕成極薄透明片狀。",
        color: 0x94a3b8,
        geometry: "sheet"
    },
    garnet: {
        name: "石榴石 (Garnet)",
        formula: "Fe₃Al₂(SiO₄)₃",
        hardness: 7.5,
        cleavage: "無解理",
        luster: "玻璃至金剛光澤",
        desc: "常見於變質岩中，晶體多呈十二面體或二十四面體。顏色多為深紅至紅褐色。",
        tip: "結晶外形極像石榴籽，硬度非常高（可劃傷玻璃），常作為研磨材料。",
        color: 0x9f1239,
        geometry: "dodecahedron"
    }
};

// --- 全域變數 ---
let currentUser = null;
let currentMineralKey = "quartz";
let posts = [
    {
        id: 1,
        author: "ntu_geology@ntu.edu.tw",
        content: "請教老師，方解石跟石英外觀很像，在野外最快的分辨方式是什麼？",
        tag: "方解石",
        upvotes: 8,
        time: "10:15 AM",
        isTeacherAnswered: true,
        answer: "老師回答：用稀鹽酸測試（方解石會冒泡）或拿小刀劃劃看（小刀能劃傷方解石，但劃不動石英）。"
    },
    {
        id: 2,
        author: "student_01@gapps.ntu.edu.tw",
        content: "黃鐵礦的立方體結晶真的很神奇！它是自然形成的還是人工切割的？",
        tag: "黃鐵礦",
        upvotes: 5,
        time: "11:02 AM",
        isTeacherAnswered: false
    }
];

// --- 3D 渲染系統 (Three.js) ---
let scene, camera, renderer, currentMesh;
let isWireframe = false;

function init3D() {
    const container = document.getElementById('canvasContainer');
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 光源設置
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 0.5);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    loadMineralMesh(currentMineralKey);

    // 拖曳旋轉機制
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mousemove', (e) => {
        if (isDragging && currentMesh) {
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };
            currentMesh.rotation.y += deltaMove.x * 0.01;
            currentMesh.rotation.x += deltaMove.y * 0.01;
        }
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // 自動微幅旋轉動畫
    function animate() {
        requestAnimationFrame(animate);
        if (currentMesh && !isDragging) {
            currentMesh.rotation.y += 0.005;
        }
        renderer.render(scene, camera);
    }
    animate();

    // 視窗 resize 處理
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function loadMineralMesh(key) {
    if (currentMesh) scene.remove(currentMesh);

    const data = MINERALS[key];
    let geometry;

    switch (data.geometry) {
        case "quartz":
            geometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 6);
            break;
        case "cube":
            geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
            break;
        case "octahedron":
            geometry = new THREE.OctahedronGeometry(1.2);
            break;
        case "rhombohedron":
            geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
            break;
        case "sheet":
            geometry = new THREE.BoxGeometry(1.8, 0.1, 1.4);
            break;
        case "dodecahedron":
            geometry = new THREE.DodecahedronGeometry(1.2);
            break;
        default:
            geometry = new THREE.SphereGeometry(1, 16, 16);
    }

    const material = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.3,
        metalness: key === 'pyrite' ? 0.8 : 0.1,
        wireframe: isWireframe
    });

    currentMesh = new THREE.Mesh(geometry, material);
    
    if (key === 'calcite') {
        currentMesh.rotation.z = 0.3;
        currentMesh.rotation.x = 0.3;
    }

    scene.add(currentMesh);
}

// --- 身分驗證邏輯 ---
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('schoolEmail').value.trim();
    const errorEl = document.getElementById('authError');

    // 驗證是否包含 .edu.tw
    if (!emailInput.toLowerCase().endsWith('.edu.tw')) {
        errorEl.classList.remove('hidden');
        return;
    }

    errorEl.classList.add('hidden');
    currentUser = { email: emailInput, loginTime: new Date().toLocaleTimeString() };

    // 隱藏 Modal，顯示使用者資訊
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userEmailDisplay').textContent = emailInput;

    // 觸發撒花特效
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    currentUser = null;
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
});

// --- 礦物切換邏輯 ---
function renderMineralSelectors() {
    const container = document.getElementById('mineralSelector');
    container.innerHTML = Object.keys(MINERALS).map(key => {
        const item = MINERALS[key];
        const isActive = key === currentMineralKey;
        return `
            <button onclick="switchMineral('${key}')" 
                class="p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isActive 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md' 
                    : 'bg-slate-800 border-slate-700/80 text-slate-400 hover:bg-slate-700/50'
                }">
                <div class="text-xs font-bold truncate">${item.name.split(' ')[0]}</div>
                <div class="text-[10px] opacity-70">硬度: ${item.hardness}</div>
            </button>
        `;
    }).join('');
}

function switchMineral(key) {
    currentMineralKey = key;
    const data = MINERALS[key];

    // 更新 DOM
    document.getElementById('activeMineralTag').textContent = data.name;
    document.getElementById('activeHardnessTag').textContent = `硬度: ${data.hardness}`;
    document.getElementById('mineralTitle').textContent = data.name;
    document.getElementById('mineralFormula').textContent = data.formula;
    document.getElementById('detailHardness').textContent = data.hardness;
    document.getElementById('detailCleavage').textContent = data.cleavage;
    document.getElementById('detailLuster').textContent = data.luster;
    document.getElementById('mineralDescription').textContent = data.desc;
    document.getElementById('fieldTip').textContent = data.tip;

    // 更新下拉選單標籤
    document.getElementById('qaTagSelect').value = data.name.split(' ')[0];

    renderMineralSelectors();
    loadMineralMesh(key);
}

// 晶架切換
document.getElementById('toggleWireframe').addEventListener('click', () => {
    isWireframe = !isWireframe;
    if (currentMesh) currentMesh.material.wireframe = isWireframe;
});

// --- Slido 留言牆邏輯 ---
function renderQAPosts() {
    const list = document.getElementById('qaList');
    list.innerHTML = posts.sort((a, b) => b.upvotes - a.upvotes).map(post => `
        <div class="bg-slate-900/70 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
            <div class="flex justify-between items-start">
                <div class="flex items-center space-x-2">
                    <span class="text-xs text-slate-400 font-mono">${post.author.split('@')[0]}***</span>
                    <span class="bg-slate-800 border border-slate-700 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full">
                        #${post.tag}
                    </span>
                </div>
                <span class="text-[10px] text-slate-500">${post.time}</span>
            </div>
            
            <p class="text-xs text-slate-200 leading-relaxed">${post.content}</p>

            ${post.isTeacherAnswered ? `
                <div class="bg-indigo-950/50 border border-indigo-800/50 p-2.5 rounded-lg text-xs text-indigo-200 mt-2">
                    <i class="fa-solid fa-circle-check text-indigo-400 mr-1"></i> ${post.answer}
                </div>
            ` : ''}

            <div class="flex justify-end pt-1">
                <button onclick="upvotePost(${post.id})" class="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition">
                    <i class="fa-solid fa-thumbs-up text-indigo-400"></i>
                    <span>${post.upvotes}</span>
                </button>
            </div>
        </div>
    `).join('');
}

function upvotePost(id) {
    const post = posts.find(p => p.id === id);
    if (post) {
        post.upvotes++;
        renderQAPosts();
    }
}

document.getElementById('qaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const content = document.getElementById('qaContent').value.trim();
    const tag = document.getElementById('qaTagSelect').value;

    if (!content) return;

    posts.unshift({
        id: Date.now(),
        author: currentUser.email,
        content: content,
        tag: tag,
        upvotes: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTeacherAnswered: false
    });

    document.getElementById('qaContent').value = '';
    renderQAPosts();
});

// --- 匯出 CSV 學習紀錄 (給教師管理視角) ---
document.getElementById('exportCsvBtn').addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "學生信箱,提問內容,關聯標籤,獲得讚數,發言時間\n";

    posts.forEach(p => {
        csvContent += `"${p.author}","${p.content.replace(/"/g, '""')}","${p.tag}",${p.upvotes},"${p.time}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GeoLearner_學習互動紀錄_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- 初始化執行 ---
window.addEventListener('DOMContentLoaded', () => {
    init3D();
    renderMineralSelectors();
    renderQAPosts();
});
