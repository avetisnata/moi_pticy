// Инициализация
let birds = JSON.parse(localStorage.getItem('birds')) || [];
let pairs = JSON.parse(localStorage.getItem('pairs')) || [];
let clutches = JSON.parse(localStorage.getItem('clutches')) || [];
let editingId = null;

// Загрузка при старте
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    renderBirds();
    renderPairs();
    renderClutches();
    //     renderCalendar();
    setupEventListeners();
    updateDropdowns();
});

function setupEventListeners() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Обработчики для улучшенного поиска
    const searchInput = document.getElementById('bird-search');
    const clearBtn = document.getElementById('clear-search');
    
    searchInput.addEventListener('input', function() {
        clearBtn.style.display = this.value ? 'block' : 'none';
        renderBirds();
    });
    
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        renderBirds();
    });
    
    document.getElementById('bird-search').addEventListener('input', renderBirds);
    document.getElementById('bird-form').addEventListener('submit', saveBird);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');    document.getElementById(tabName).classList.add('active');
}

// ===== ПТИЦЫ =====
function addBird() {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Добавить птицу';
    document.getElementById('bird-form').reset();
    document.getElementById('bird-modal').classList.add('active');
}

function editBird(id) {
    editingId = id;
    const bird = birds.find(b => b.id === id);
    document.getElementById('modal-title').textContent = 'Редактировать птицу';
    document.getElementById('ring').value = bird.ring;
    document.getElementById('name').value = bird.name;
    document.getElementById('species').value = bird.species;
    document.getElementById('gender').value = bird.gender;
    document.getElementById('birthdate').value = bird.birthdate;
    document.getElementById('color').value = bird.color;
        document.getElementById('notes').value = bird.notes || '';
    document.getElementById('bird-modal').classList.add('active');
}

function saveBird(e) {
    e.preventDefault();
    const birdData = {
        id: editingId || Date.now(),
        ring: document.getElementById('ring').value,
        name: document.getElementById('name').value,
        species: document.getElementById('species').value,
        gender: document.getElementById('gender').value,
        birthdate: document.getElementById('birthdate').value,
        color: document.getElementById('color').value,
                notes: document.getElementById('notes').value,
        status: 'active'
    };
    
    if (editingId) {
        const index = birds.findIndex(b => b.id === editingId);
        birds[index] = birdData;
    } else {
        birds.push(birdData);
    }
    
    saveData();
    renderBirds();
    updateDropdowns();
    closeModal();
}

function deleteBird(id) {
    if (confirm('Удалить птицу?')) {
        birds = birds.filter(b => b.id !== id);
        saveData();
        renderBirds();
        updateDropdowns();
    }
}

function renderBirds() {
    const search = document.getElementById('bird-search').value.toLowerCase();
    const tbody = document.querySelector('#birds-table tbody');
    tbody.innerHTML = '';
    
    birds.filter(bird => 
        bird.ring.toLowerCase().includes(search) || 
        bird.name.toLowerCase().includes(search)
    ).forEach(bird => {
        const row = tbody.insertRow();
        row.innerHTML = `
                <td>${bird.ring}</td>
                <td>${bird.name || '-'}</td>
                <td>${bird.gender || '-'}</td>
                <td class="birthdate-col">${bird.birthdate ? new Date(bird.birthdate).toLocaleDateString('ru-RU') : '-'}</td>
                <td>${bird.color || '-'}</td>
                <td>${bird.notes || '-'}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editBird(${bird.id})">✏️</button>
                    <button class="action-btn btn-delete" onclick="deleteBird(${bird.id})">🗑️</button>
            </td>
        `;
            
    });

        // Обновление счётчика результатов
    const filteredCount = birds.filter(bird =>
        bird.ring.toLowerCase().includes(search) ||
        bird.name.toLowerCase().includes(search)
    ).length;
    
    const resultsDiv = document.getElementById('search-results');
    if (search) {
        resultsDiv.textContent = `Найдено: ${filteredCount} из ${birds.length}`;
    } else {
        resultsDiv.textContent = '';
    }

}

// ===== ПАРЫ =====
function createPair() {
    const maleId = document.getElementById('male-select').value;
    const femaleId = document.getElementById('female-select').value;
        const pairNumber = document.getElementById('pair-number').value;
        const pairColor = document.getElementById('pair-color').value;
    
    if (!maleId || !femaleId || maleId === femaleId) {
        alert('Выберите самца и самку!');
        return;
    }
    
    const pair = {
        id: Date.now(),
        male: parseInt(maleId),
        female: parseInt(femaleId),
                number: pairNumber,
                color: pairColor,
        created: new Date().toISOString().split('T')[0],
        status: 'active',
        clutches: []
    };
    
    pairs.push(pair);
    saveData();
    renderPairs();
    updateDropdowns();
}

function renderPairs() {
    const tbody = document.querySelector('#pairs-table tbody');
    tbody.innerHTML = '';
    
    pairs.forEach(pair => {
        const male = birds.find(b => b.id === pair.male);
        const female = birds.find(b => b.id === pair.female);
        const row = tbody.insertRow();
        row.innerHTML = `
<td>${pair.number || '-'}</td>
            <td>${pair.color || '-'}</td>
                        <td>${male ? male.ring + ' (' + male.name + ')' : 'Удалена'}</td>
            <td>${female ? female.ring + ' (' + female.name + ')' : 'Удалена'}</td>
            <td>${pair.created}</td>
            <td class="status-${pair.status}">${pair.status === 'active' ? 'Активна' : 'Неактивна'}</td>
            <td>${pair.clutches.length}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editPair(${pair.id})">✏️</button>
                <button class="action-btn btn-delete" onclick="deletePair(${pair.id})">🗑️</button>
            </td>
        `;
    });
    document.getElementById('pair-select-clutch').innerHTML = pairs.map(p => 
        `<option value="${p.id}">Пара ${p.number || p.id}</option>`    ).join('');
}

function updateDropdowns() {
    const males = birds.filter(b => b.gender === '♂');
    const females = birds.filter(b => b.gender === '♀');
    
    document.getElementById('male-select').innerHTML = 
        '<option value="">Выберите самца</option>' + 
        males.map(b => `<option value="${b.id}">${b.ring} (${b.name})</option>`).join('');
    
    document.getElementById('female-select').innerHTML = 
        '<option value="">Выберите самку</option>' + 
        females.map(b => `<option value="${b.id}">${b.ring} (${b.name})</option>`).join('');
}

// ===== КЛАДКИ =====
function addClutch() {
    const pairId = document.getElementById('pair-select-clutch').value;
        const clutchNumber = document.getElementById('clutch-number').value;
        const clutchDate = document.getElementById('clutch-date').value;
        const hatchDate = document.getElementById('hatch-date').value;
        const ringNumbers = document.getElementById('ring-numbers').value;
        const clutchNotes = document.getElementById('clutch-notes').value;
    if (!pairId) {
        alert('Выберите пару!');
        return;
    }
    
    const clutch = {
        id: Date.now(),
        pairId: parseInt(pairId),
        layDate: clutchDate || new Date().toISOString().split('T')[0],        eggs: 4,
        hatched: 0,
        hatchDate: hatchDate || '' ,
            number: clutchNumber,
                        ringNumbers: ringNumbers,
                        notes: clutchNotes
                                };
    const pair = pairs.find(p => p.id == pairId);
    pair.clutches.push(clutch.id);
    clutches.push(clutch);
    
    saveData();
    renderClutches();
}

function renderClutches() {
    const tbody = document.querySelector('#clutches-table tbody');
    tbody.innerHTML = '';
    
    clutches.forEach(clutch => {
        const pair = pairs.find(p => p.id === clutch.pairId);
        const row = tbody.insertRow();
        row.innerHTML = `
<td>${clutch.number || '-'}</td>
                        <td>${pair ? pair.number : 'Удалена'}</td>
            <td>${clutch.layDate}</td>
            <td>${clutch.eggs}</td>
            <td>${clutch.hatched}</td>
            <td>${clutch.hatchDate || '-'}</td>
            <td>${clutch.ringNumbers || '-'}</td>
            <td>${clutch.notes || '-'}</td>
                            <td>
                    <button class="action-btn btn-edit" onclick="editClutch(${clutch.id})">✏️</button>
                    <button class="action-btn btn-delete" onclick="deleteClutch(${clutch.id})">🗑️</button>
                </td>
        `;
    });
            console.log('deleteClutch called with id:', id, 'clutches before:', clutches);
}
 onclick="editClutch(${clutch.id})"
// ===== КАЛЕНДАРЬ =====
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const today = new Date();
    grid.innerHTML = '<div class="calendar-header">Календарь кормлений на неделю</div>';
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerHTML = `
            <div style="font-weight: bold;">${date.toLocaleDateString('ru-RU')}</div>
            <div style="font-size: 0.9em; color: #666;">${date.toLocaleDateString('ru-RU', {weekday: 'short'})}</div>
            <div>Задачи: 0</div>
        `;
        grid.appendChild(dayDiv);
    }
}

// ===== СТАТИСТИКА =====
function updateStats() {
    document.getElementById('total-birds').textContent = `Птиц: ${birds.length}`;
    document.getElementById('active-pairs').textContent = `Пар: ${pairs.filter(p => p.status === 'active').length}`;
    document.getElementById('total-clutches').textContent = `Кладок: ${clutches.length}`;
    
    document.getElementById('stats-content').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                <h3>Всего птиц</h3><div style="font-size: 2.5em;">${birds.length}</div>
            </div>
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                <h3>Самцов</h3><div style="font-size: 2.5em;">${birds.filter(b => b.gender === '♂').length}</div>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                <h3>Самок</h3><div style="font-size: 2.5em;">${birds.filter(b => b.gender === '♀').length}</div>
            </div>
            <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                <h3>Вылупилось птенцов</h3><div style="font-size: 2.5em;">${clutches.reduce((sum, c) => sum + c.hatched, 0)}</div>
            </div>
        </div>
    `;
}

// ===== УТИЛИТЫ =====
function closeModal() {
    document.getElementById('bird-modal').classList.remove('active');
}

function saveData() {
    localStorage.setItem('birds', JSON.stringify(birds));
    localStorage.setItem('pairs', JSON.stringify(pairs));
    localStorage.setItem('clutches', JSON.stringify(clutches));
    updateStats();
}

function exportData(format) {
    const data = { birds, pairs, clutches };
    const csv = 'Кольцо,Имя,Вид,Пол,Дата рождения,Цвет\n' + 
                birds.map(b => `${b.ring},"${b.name || ''}","${b.species || ''}",${b.gender},"${b.birthdate || ''}","${b.color || ''}"`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `moi_ptici_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Заглушки для других функций
function editPair(id) {
    const pair = pairs.find(p => p.id === id);
    if (!pair) return;
    
    const newNumber = prompt('Номер пары:', pair.number || '');
    const newColor = prompt('Цвет метки:', pair.color || '');
    
    if (newNumber !== null) pair.number = newNumber;
    if (newColor !== null) pair.color = newColor;
    
    saveData();
    renderPairs();
}function deletePair(id) { 
    if (confirm('Удалить пару?')) {
        pairs = pairs.filter(p => p.id !== id);

        function editClutch(id) {
    const clutch = clutches.find(c => c.id === id);
    if (!clutch) return;
    
    const newNumber = prompt('Номер кладки:', clutch.number || '');
    const newDate = prompt('Дата кладки (YYYY-MM-DD):', clutch.layDate || '');
    const newHatchDate = prompt('Дата вылупления (YYYY-MM-DD):', clutch.hatchDate || '');
    const newRingNumbers = prompt('Номера колец (через запятую):', clutch.ringNumbers || '');
    const newNotes = prompt('Примечания:', clutch.notes || '');
    
    if (newNumber !== null) clutch.number = newNumber;
    if (newDate !== null) clutch.layDate = newDate;
    if (newHatchDate !== null) clutch.hatchDate = newHatchDate;
    if (newRingNumbers !== null) clutch.ringNumbers = newRingNumbers;
    if (newNotes !== null) clutch.notes = newNotes;
    
    saveData();
    renderClutches();
}
        
function deleteClutch(id) {
    if (confirm('Удалить кладку?')) {
        clutches = clutches.filter(c => c.id !== id);
        saveData();
        renderClutches();
    }
}
        saveData();
        renderPairs();
    }
}

// ===== Кладки =====
let editingClutchId = null;

function openClutchModalForNew() {
    editingClutchId = null;
    document.getElementById('clutch-modal-title').textContent = 'Добавить кладку';

    // Автоподстановка номера пары из select
    // Автоподстановка номера пары из select
    const select = document.getElementById('pair-select-clutch');
    const selectedPairId = select && select.value ? select.value : '';
    let pairNumber = '';
    if (selectedPairId) {
        const pair = pairs.find(p => p.id == selectedPairId);
        pairNumber = pair ? (pair.number || '') : '';
    }
    document.getElementById('clutch-pair-number').value = pairNumber;
    document.getElementById('clutch-number-input').value = '';
    document.getElementById('clutch-eggs-count').value = '';
    document.getElementById('clutch-date-lay').value = '';
    document.getElementById('clutch-date-hatch').value = '';
    document.getElementById('clutch-ring-numbers').value = '';
    document.getElementById('clutch-notes-modal').value = '';

    openClutchModal();
}

function openClutchModal() {
    document.getElementById('clutch-modal').classList.add('active');
}

function closeClutchModal() {
    document.getElementById('clutch-modal').classList.remove('active');
}

function saveClutch() {
    const pairNumber = document.getElementById('clutch-pair-number').value.trim();
    const clutchNumber = document.getElementById('clutch-number-input').value.trim();
    const eggsCount = document.getElementById('clutch-eggs-count').value.trim();
    const layDate = document.getElementById('clutch-date-lay').value;
    const hatchDate = document.getElementById('clutch-date-hatch').value;
    const rings = document.getElementById('clutch-ring-numbers').value.trim();
    const notes = document.getElementById('clutch-notes-modal').value.trim();

    if (!pairNumber || !clutchNumber) {
        alert('Укажите номер пары и номер кладки');
        return;
    }

    if (editingClutchId) {
        // Редактирование существующей
        const idx = clutches.findIndex(c => c.id === editingClutchId);
        if (idx !== -1) {
            clutches[idx] = {
                ...clutches[idx],
                pairNumber,
                clutchNumber,
                eggsCount,
                layDate,
                hatchDate,
                rings,
                notes
            };
        }
    } else {
        // Новая кладка
        const newClutch = {
            id: Date.now(),
            pairNumber,
            clutchNumber,
            eggsCount,
            layDate,
            hatchDate,
            rings,
            notes
        };
        clutches.push(newClutch);
    }

    localStorage.setItem('clutches', JSON.stringify(clutches));
    renderClutches();
    closeClutchModal();
    updateStats();
}

function renderClutches() {
    const tbody = document.getElementById('clutches-table')?.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    clutches.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.pairNumber}</td>
            <td>${c.clutchNumber}</td>
            <td>${c.eggsCount || ''}</td>
            <td>${c.layDate || ''}</td>
            <td>${c.hatchDate || ''}</td>
            <td>${c.rings || ''}</td>
            <td>${c.notes || ''}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editClutch(${c.id})">Редактировать</button>
                <button class="action-btn btn-delete" onclick="deleteClutch(${c.id})">Удалить</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editClutch(id) {
    const clutch = clutches.find(c => c.id === id);
    if (!clutch) return;

    editingClutchId = id;
    document.getElementById('clutch-modal-title').textContent = 'Редактировать кладку';

    document.getElementById('clutch-pair-number').value = clutch.pairNumber || '';
    document.getElementById('clutch-number-input').value = clutch.clutchNumber || '';
    document.getElementById('clutch-eggs-count').value = clutch.eggsCount || '';
    document.getElementById('clutch-date-lay').value = clutch.layDate || '';
    document.getElementById('clutch-date-hatch').value = clutch.hatchDate || '';
    document.getElementById('clutch-ring-numbers').value = clutch.rings || '';
    document.getElementById('clutch-notes-modal').value = clutch.notes || '';

    openClutchModal();
}

// Функция deleteClutch уже есть в файле, не дублируем

// Обработка субмита формы
document.getElementById('clutch-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    saveClutch();
});

// Перезаписываем функцию deleteClutch для гарантии работы
function deleteClutch(id) {
    console.log('deleteClutch вызвана с id:', id);
    if (confirm('Удалить кладку?')) {
        console.log('Подтверждено удаление');
        clutches = clutches.filter(c => c.id != id); // нестрогое сравнение
        localStorage.setItem('clutches', JSON.stringify(clutches));
        renderClutches();
        updateStats();
        console.log('Кладка удалена, список обновлен');
    }
}



















