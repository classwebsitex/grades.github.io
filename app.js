// Main application logic
const app = {
    // Default subjects with translations
    defaultSubjects: [
        { id: 'italiano', nameKey: 'italiano', grades: [] },
        { id: 'inglese', nameKey: 'inglese', grades: [] },
        { id: 'matematica', nameKey: 'matematica', grades: [] },
        { id: 'storia', nameKey: 'storia', grades: [] },
        { id: 'geografia', nameKey: 'geografia', grades: [] },
        { id: 'scienze', nameKey: 'scienze', grades: [] },
        { id: 'francese', nameKey: 'francese', grades: [] },
        { id: 'arteEImmagine', nameKey: 'arteEImmagine', grades: [] },
        { id: 'musica', nameKey: 'musica', grades: [] },
        { id: 'educazioneCivica', nameKey: 'educazioneCivica', grades: [] },
        { id: 'scienzeMotorie', nameKey: 'scienzeMotorie', grades: [] },
        { id: 'tecnologiaEInformatica', nameKey: 'tecnologiaEInformatica', grades: [] }
    ],
    
    subjects: [],
    currentSubjectId: null,
    
    // Initialize the application
    init() {
        this.loadData();
        this.renderSubjects();
        this.updateStats();
        this.setupEventListeners();
        this.applyAnimationOrder();
    },
    
    // Apply animation order to elements for staggered animations
    applyAnimationOrder() {
        // Apply animation order to stat cards
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            card.style.setProperty('--animation-order', index);
        });
        
        // Apply animation order to tool buttons
        document.querySelectorAll('.tool-btn').forEach((btn, index) => {
            btn.style.setProperty('--animation-order', index);
        });
        
        // Apply animation order to subject cards
        document.querySelectorAll('.subject-card').forEach((card, index) => {
            card.style.setProperty('--animation-order', index);
        });
    },
    
    // Load data from localStorage and cookies
    loadData() {
        // Try to load from localStorage first
        const savedSubjects = localStorage.getItem('gradeCalculator_subjects');
        if (savedSubjects) {
            this.subjects = JSON.parse(savedSubjects);
        } else {
            // If not in localStorage, try cookies
            const cookieData = CookieManager.getCookie('gradeCalculator_subjects');
            if (cookieData) {
                try {
                    this.subjects = JSON.parse(decodeURIComponent(cookieData));
                } catch (e) {
                    console.error('Error parsing cookie data:', e);
                    this.subjects = JSON.parse(JSON.stringify(this.defaultSubjects));
                }
            } else {
                // If no data found, use defaults
                this.subjects = JSON.parse(JSON.stringify(this.defaultSubjects));
            }
        }
        
        // Setup theme mode (light/dark)
        // Try localStorage first, then cookies
        let savedThemeMode = localStorage.getItem('themeMode');
        if (!savedThemeMode) {
            savedThemeMode = CookieManager.getCookie('themeMode');
        }
        
        if (savedThemeMode === 'dark') {
            document.body.classList.add('dark-theme');
            document.querySelector('#theme-toggle-btn i').classList.replace('fa-moon', 'fa-sun');
        }
        
        // Setup color theme
        // Try localStorage first, then cookies
        let savedColorTheme = localStorage.getItem('colorTheme');
        if (!savedColorTheme) {
            savedColorTheme = CookieManager.getCookie('colorTheme');
        }
        
        if (savedColorTheme && savedColorTheme !== 'default') {
            document.body.classList.add(`${savedColorTheme}-theme`);
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.toggle('active', option.dataset.theme === savedColorTheme);
            });
        } else {
            document.querySelector('.theme-option[data-theme="default"]').classList.add('active');
        }
    },
    
    // Save data to localStorage and cookies
    saveData() {
        // Clear cached values before saving
        this.invalidateCache();
        
        // Use a more efficient approach to remove cache properties before saving
        const subjectsToSave = this.subjects.map(subject => {
            const { _cachedAverage, _cachedGradesCount, ...subjectToSave } = subject;
            return subjectToSave;
        });
        
        const jsonData = JSON.stringify(subjectsToSave);
        
        // Save to localStorage
        localStorage.setItem('gradeCalculator_subjects', jsonData);
        
        // Save to cookies (with size limitation)
        try {
            // Cookies have size limitations, so we'll only save if it's not too large
            if (jsonData.length < 4000) { // Most browsers limit cookies to ~4KB
                CookieManager.setCookie('gradeCalculator_subjects', encodeURIComponent(jsonData));
            }
        } catch (e) {
            console.warn('Could not save data to cookies (possibly too large):', e);
        }
    },
    
    // Invalidate all cached calculations
    invalidateCache() {
        // Clear app-level cache
        this._cachedFinalAverage = undefined;
        this._lastGradesCount = undefined;
        
        // Clear subject-level cache
        this.subjects.forEach(subject => {
            subject._cachedAverage = undefined;
            subject._cachedGradesCount = undefined;
        });
    },
    
    // Open import modal
    openImportModal() {
        // Reset the import form
        document.getElementById('import-file').value = '';
        document.getElementById('import-text').value = '';
        document.getElementById('import-result').style.display = 'none';
        document.getElementById('import-result').innerHTML = '';
        document.getElementById('import-result').className = 'import-result';
        
        // Show modal
        document.getElementById('import-modal').classList.add('active');
        const overlay = document.querySelector('.overlay');
        overlay.style.display = 'block';
        setTimeout(() => overlay.classList.add('active'), 10);
    },
    
    // Import data from file
    importFromFile() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        const importResult = document.getElementById('import-result');
        
        if (!file) {
            importResult.innerHTML = getTranslation('importError');
            importResult.className = 'import-result error';
            importResult.style.display = 'block';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.processImportedData(data);
            } catch (e) {
                console.error('Error parsing JSON file:', e);
                importResult.innerHTML = getTranslation('importError');
                importResult.className = 'import-result error';
                importResult.style.display = 'block';
            }
        };
        
        reader.onerror = () => {
            importResult.innerHTML = getTranslation('importError');
            importResult.className = 'import-result error';
            importResult.style.display = 'block';
        };
        
        reader.readAsText(file);
    },
    
    // Import data from text
    importFromText() {
        const textInput = document.getElementById('import-text');
        const jsonText = textInput.value.trim();
        const importResult = document.getElementById('import-result');
        
        if (!jsonText) {
            importResult.innerHTML = getTranslation('importError');
            importResult.className = 'import-result error';
            importResult.style.display = 'block';
            return;
        }
        
        try {
            const data = JSON.parse(jsonText);
            this.processImportedData(data);
        } catch (e) {
            console.error('Error parsing JSON text:', e);
            importResult.innerHTML = getTranslation('importError');
            importResult.className = 'import-result error';
            importResult.style.display = 'block';
        }
    },
    
    // Process imported data
    processImportedData(data) {
        const importResult = document.getElementById('import-result');
        
        try {
            // Validate the imported data
            if (data.subjects && Array.isArray(data.subjects)) {
                this.subjects = data.subjects;
                this.saveData();
                this.renderSubjects();
                this.updateStats();
                
                importResult.innerHTML = getTranslation('importSuccess');
                importResult.className = 'import-result success';
                importResult.style.display = 'block';
                
                // Close the modal after a delay
                setTimeout(() => {
                    this.closeModals();
                }, 2000);
            } else if (Array.isArray(data)) {
                // If it's just an array, assume it's the subjects array
                this.subjects = data;
                this.saveData();
                this.renderSubjects();
                this.updateStats();
                
                importResult.innerHTML = getTranslation('importSuccess');
                importResult.className = 'import-result success';
                importResult.style.display = 'block';
                
                // Close the modal after a delay
                setTimeout(() => {
                    this.closeModals();
                }, 2000);
            } else {
                throw new Error('Invalid data format');
            }
        } catch (e) {
            console.error('Error processing imported data:', e);
            importResult.innerHTML = getTranslation('importError');
            importResult.className = 'import-result error';
            importResult.style.display = 'block';
        }
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Theme toggle (dark/light mode)
        document.getElementById('theme-toggle-btn').addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            const themeMode = isDark ? 'dark' : 'light';
            
            // Save to both localStorage and cookies
            localStorage.setItem('themeMode', themeMode);
            CookieManager.setCookie('themeMode', themeMode);
            
            const icon = document.querySelector('#theme-toggle-btn i');
            if (isDark) {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
        });
        
        // Theme panel toggle
        document.getElementById('theme-panel-btn').addEventListener('click', () => {
            document.querySelector('.theme-panel').classList.toggle('active');
        });
        
        // Close theme panel
        document.querySelector('.close-panel').addEventListener('click', () => {
            document.querySelector('.theme-panel').classList.remove('active');
        });
        
        // Theme options
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                
                // Remove all theme classes
                document.body.classList.remove('ocean-theme', 'sunset-theme', 'forest-theme', 'lavender-theme');
                
                // Remove active class from all options
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                
                // Add active class to selected option
                option.classList.add('active');
                
                // Apply selected theme
                if (theme !== 'default') {
                    document.body.classList.add(`${theme}-theme`);
                }
                
                // Save theme preference to both localStorage and cookies
                localStorage.setItem('colorTheme', theme);
                CookieManager.setCookie('colorTheme', theme);
            });
        });
        
        // Import data button
        document.getElementById('import-data-btn').addEventListener('click', () => {
            this.openImportModal();
        });
        
        // Import from file button
        document.getElementById('import-file-btn').addEventListener('click', () => {
            this.importFromFile();
        });
        
        // Import from text button
        document.getElementById('import-text-btn').addEventListener('click', () => {
            this.importFromText();
        });
        
        // Export data button
        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.exportData();
        });
        
        // Goal calculator button
        document.getElementById('goal-calculator-btn').addEventListener('click', () => {
            this.openGoalCalculator();
        });
        
        // Add grade button in subject modal
        document.getElementById('add-grade-btn').addEventListener('click', () => {
            this.addGrade();
        });
        
        // Hypothetical grade calculator
        document.getElementById('hypothetical-grade').addEventListener('input', (e) => {
            this.calculateHypothetical(e.target.value);
        });
        
        // Target calculator
        document.getElementById('calculate-target-btn').addEventListener('click', () => {
            this.calculateTarget();
        });
        
        // Goal calculator
        document.getElementById('calculate-goal-btn').addEventListener('click', () => {
            this.calculateGoal();
        });
        
        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });
        
        document.querySelector('.overlay').addEventListener('click', () => {
            this.closeModals();
        });
    },
    
    // Render all subjects with performance optimizations
    renderSubjects() {
        const subjectsGrid = document.querySelector('.subjects-grid');
        
        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Clear the grid
        while (subjectsGrid.firstChild) {
            subjectsGrid.removeChild(subjectsGrid.firstChild);
        }
        
        // Create and append all subject cards
        this.subjects.forEach((subject, index) => {
            const average = this.calculateSubjectAverage(subject);
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.dataset.id = subject.id;
            card.style.setProperty('--animation-order', index);
            
            card.innerHTML = `
                <div class="subject-average-circle">${average.toFixed(2)}</div>
                <div class="subject-info">
                    <div class="subject-name">${getTranslation(subject.nameKey)}</div>
                    <div class="subject-grades-count">${subject.grades.length} ${getTranslation('grades')}</div>
                </div>
            `;
            
            // Use event delegation for better performance
            card.addEventListener('click', () => {
                this.openSubjectModal(subject.id);
            }, { passive: true }); // Add passive flag for better scroll performance
            
            fragment.appendChild(card);
        });
        
        // Append all cards at once
        subjectsGrid.appendChild(fragment);
    },
    
    // Update statistics with animation
    updateStats() {
        const finalAverage = this.calculateFinalAverage();
        const totalSubjects = this.subjects.length;
        const totalGrades = this.subjects.reduce((total, subject) => total + subject.grades.length, 0);
        
        // Animate the stat values
        this.animateStatValue('final-average', finalAverage.toFixed(2));
        this.animateStatValue('total-subjects', totalSubjects);
        this.animateStatValue('total-grades', totalGrades);
    },
    
    // Animate a stat value changing
    animateStatValue(elementId, newValue) {
        const element = document.getElementById(elementId);
        const currentValue = element.textContent;
        
        // Only animate if the value has changed
        if (currentValue !== newValue.toString()) {
            element.classList.add('updating');
            
            // Use requestAnimationFrame for smoother animation
            requestAnimationFrame(() => {
                element.textContent = newValue;
                
                // Remove the animation class after animation completes
                setTimeout(() => {
                    element.classList.remove('updating');
                }, 600);
            });
        }
    },
    
    // Calculate subject average with memoization for performance
    calculateSubjectAverage(subject) {
        // If the subject has a cached average and no grades have been added/removed, return the cached value
        if (subject._cachedAverage !== undefined && subject._cachedGradesCount === subject.grades.length) {
            return subject._cachedAverage;
        }
        
        if (!subject.grades.length) {
            // Cache the result
            subject._cachedAverage = 0;
            subject._cachedGradesCount = 0;
            return 0;
        }
        
        // Calculate the average
        const sum = subject.grades.reduce((total, grade) => total + parseFloat(grade.value), 0);
        const average = sum / subject.grades.length;
        
        // Cache the result
        subject._cachedAverage = average;
        subject._cachedGradesCount = subject.grades.length;
        
        return average;
    },
    
    // Calculate final average with optimizations
    calculateFinalAverage() {
        // Use cached values where possible
        if (this._cachedFinalAverage !== undefined && 
            this._lastGradesCount === this.subjects.reduce((total, subject) => total + subject.grades.length, 0)) {
            return this._cachedFinalAverage;
        }
        
        const subjectsWithGrades = this.subjects.filter(subject => subject.grades.length > 0);
        
        if (subjectsWithGrades.length === 0) {
            this._cachedFinalAverage = 0;
            this._lastGradesCount = 0;
            return 0;
        }
        
        // Use map instead of reduce for better performance
        const averages = subjectsWithGrades.map(subject => this.calculateSubjectAverage(subject));
        const sum = averages.reduce((total, avg) => total + avg, 0);
        const finalAverage = sum / subjectsWithGrades.length;
        
        // Cache the result
        this._cachedFinalAverage = finalAverage;
        this._lastGradesCount = this.subjects.reduce((total, subject) => total + subject.grades.length, 0);
        
        return finalAverage;
    },
    
    // Open subject modal
    openSubjectModal(subjectId) {
        this.currentSubjectId = subjectId;
        const subject = this.subjects.find(s => s.id === subjectId);
        
        // Set modal title
        document.getElementById('modal-subject-name').textContent = getTranslation(subject.nameKey);
        
        // Set current average
        const average = this.calculateSubjectAverage(subject);
        document.getElementById('modal-current-average').textContent = average.toFixed(2);
        
        // Set total grades
        document.getElementById('modal-total-grades').textContent = subject.grades.length;
        
        // Render grades list
        this.renderGradesList(subject);
        
        // Reset form
        document.getElementById('grade-value').value = '';
        document.getElementById('grade-description').value = '';
        
        // Reset hypothetical calculator
        document.getElementById('hypothetical-grade').value = '';
        document.getElementById('new-subject-average').textContent = '0.00';
        document.getElementById('new-final-average').textContent = '0.00';
        
        // Reset target calculator
        document.getElementById('target-average').value = '';
        document.getElementById('target-result').style.display = 'none';
        document.getElementById('target-result').innerHTML = '';
        
        // Show modal
        document.getElementById('subject-modal').classList.add('active');
        const overlay = document.querySelector('.overlay');
        overlay.style.display = 'block';
        setTimeout(() => overlay.classList.add('active'), 10);
    },
    
    // Render grades list with performance optimizations
    renderGradesList(subject) {
        const gradesList = document.getElementById('grades-list');
        
        if (subject.grades.length === 0) {
            gradesList.innerHTML = `<p class="no-grades">${getTranslation('noGradesYet')}</p>`;
            return;
        }
        
        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Clear the list
        while (gradesList.firstChild) {
            gradesList.removeChild(gradesList.firstChild);
        }
        
        // Create and append all grade items
        subject.grades.forEach((grade, index) => {
            const gradeItem = document.createElement('div');
            gradeItem.className = 'grade-item';
            gradeItem.dataset.index = index;
            gradeItem.style.animationDelay = `${index * 0.05}s`;
            
            gradeItem.innerHTML = `
                <div class="grade-info">
                    <div class="grade-value">${parseFloat(grade.value).toFixed(2)}</div>
                    ${grade.description ? `<div class="grade-description">${grade.description}</div>` : ''}
                </div>
                <div class="grade-actions">
                    <button class="edit-grade" title="${getTranslation('edit')}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-grade" title="${getTranslation('delete')}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Use event delegation with passive listeners for better performance
            const editBtn = gradeItem.querySelector('.edit-grade');
            const deleteBtn = gradeItem.querySelector('.delete-grade');
            
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editGrade(index);
            }, { passive: true });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteGrade(index);
            }, { passive: true });
            
            fragment.appendChild(gradeItem);
        });
        
        // Append all items at once
        gradesList.appendChild(fragment);
    },
    
    // Add a new grade
    addGrade() {
        const gradeValue = document.getElementById('grade-value').value;
        const gradeDescription = document.getElementById('grade-description').value;
        
        // Validate input
        if (!gradeValue || isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
            alert(getTranslation('invalidInput'));
            return;
        }
        
        const subject = this.subjects.find(s => s.id === this.currentSubjectId);
        
        subject.grades.push({
            value: parseFloat(gradeValue),
            description: gradeDescription,
            date: new Date().toISOString()
        });
        
        this.saveData();
        this.renderGradesList(subject);
        this.renderSubjects();
        this.updateStats();
        
        // Update modal stats
        const average = this.calculateSubjectAverage(subject);
        document.getElementById('modal-current-average').textContent = average.toFixed(2);
        document.getElementById('modal-total-grades').textContent = subject.grades.length;
        
        // Reset form
        document.getElementById('grade-value').value = '';
        document.getElementById('grade-description').value = '';
    },
    
    // Edit a grade
    editGrade(index) {
        const subject = this.subjects.find(s => s.id === this.currentSubjectId);
        const grade = subject.grades[index];
        
        // Create edit form
        const gradeItem = document.querySelector(`.grade-item[data-index="${index}"]`);
        const originalContent = gradeItem.innerHTML;
        
        gradeItem.innerHTML = `
            <div class="edit-grade-form">
                <div class="form-group">
                    <input type="number" class="edit-grade-value" value="${grade.value}" min="0" max="10" step="0.01">
                </div>
                <div class="form-group">
                    <input type="text" class="edit-grade-description" value="${grade.description || ''}">
                </div>
                <div class="edit-actions">
                    <button class="save-edit">${getTranslation('save')}</button>
                    <button class="cancel-edit">${getTranslation('cancel')}</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        gradeItem.querySelector('.save-edit').addEventListener('click', () => {
            const newValue = gradeItem.querySelector('.edit-grade-value').value;
            const newDescription = gradeItem.querySelector('.edit-grade-description').value;
            
            // Validate input
            if (!newValue || isNaN(newValue) || newValue < 0 || newValue > 10) {
                alert(getTranslation('invalidInput'));
                return;
            }
            
            subject.grades[index].value = parseFloat(newValue);
            subject.grades[index].description = newDescription;
            
            this.saveData();
            this.renderGradesList(subject);
            this.renderSubjects();
            this.updateStats();
            
            // Update modal stats
            const average = this.calculateSubjectAverage(subject);
            document.getElementById('modal-current-average').textContent = average.toFixed(2);
        });
        
        gradeItem.querySelector('.cancel-edit').addEventListener('click', () => {
            gradeItem.innerHTML = originalContent;
            
            // Restore event listeners
            gradeItem.querySelector('.edit-grade').addEventListener('click', (e) => {
                e.stopPropagation();
                this.editGrade(index);
            });
            
            gradeItem.querySelector('.delete-grade').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteGrade(index);
            });
        });
    },
    
    // Delete a grade
    deleteGrade(index) {
        if (confirm(getTranslation('confirm') + '?')) {
            const subject = this.subjects.find(s => s.id === this.currentSubjectId);
            subject.grades.splice(index, 1);
            
            this.saveData();
            this.renderGradesList(subject);
            this.renderSubjects();
            this.updateStats();
            
            // Update modal stats
            const average = this.calculateSubjectAverage(subject);
            document.getElementById('modal-current-average').textContent = average.toFixed(2);
            document.getElementById('modal-total-grades').textContent = subject.grades.length;
        }
    },
    
    // Calculate hypothetical grade impact
    calculateHypothetical(value) {
        if (!value || isNaN(value) || value < 0 || value > 10) {
            document.getElementById('new-subject-average').textContent = '0.00';
            document.getElementById('new-final-average').textContent = '0.00';
            return;
        }
        
        const subject = this.subjects.find(s => s.id === this.currentSubjectId);
        const hypotheticalValue = parseFloat(value);
        
        // Calculate new subject average
        const currentGrades = [...subject.grades];
        currentGrades.push({ value: hypotheticalValue });
        
        const sum = currentGrades.reduce((total, grade) => total + parseFloat(grade.value), 0);
        const newSubjectAverage = sum / currentGrades.length;
        
        // Calculate new final average
        const subjectsCopy = JSON.parse(JSON.stringify(this.subjects));
        const subjectIndex = subjectsCopy.findIndex(s => s.id === this.currentSubjectId);
        subjectsCopy[subjectIndex].grades = currentGrades;
        
        const subjectsWithGrades = subjectsCopy.filter(subject => subject.grades.length > 0);
        let newFinalAverage = 0;
        
        if (subjectsWithGrades.length > 0) {
            const finalSum = subjectsWithGrades.reduce((total, subject) => {
                const grades = subject.grades;
                if (grades.length === 0) return total;
                
                const subjectSum = grades.reduce((sum, grade) => sum + parseFloat(grade.value), 0);
                return total + (subjectSum / grades.length);
            }, 0);
            
            newFinalAverage = finalSum / subjectsWithGrades.length;
        }
        
        document.getElementById('new-subject-average').textContent = newSubjectAverage.toFixed(2);
        document.getElementById('new-final-average').textContent = newFinalAverage.toFixed(2);
    },
    
    // Calculate target grade
    calculateTarget() {
        const targetAverage = parseFloat(document.getElementById('target-average').value);
        const desiredGrade = parseFloat(document.getElementById('desired-grade').value) || 10;
        
        if (!targetAverage || isNaN(targetAverage) || targetAverage < 0 || targetAverage > 10) {
            alert(getTranslation('invalidInput'));
            return;
        }
        
        const subject = this.subjects.find(s => s.id === this.currentSubjectId);
        const currentAverage = this.calculateSubjectAverage(subject);
        const currentGradesCount = subject.grades.length;
        
        let resultHTML = '';
        
        if (currentGradesCount === 0) {
            // If no grades yet, just need one grade equal to target
            resultHTML = `<p>${getTranslation('gradeNeeded')} ${targetAverage.toFixed(2)}</p>`;
        } else {
            // Calculate needed grade
            const neededGrade = (targetAverage * (currentGradesCount + 1)) - (currentAverage * currentGradesCount);
            
            if (neededGrade > desiredGrade) {
                // Calculate how many desired grades needed
                let gradesNeeded = 0;
                let totalValue = currentAverage * currentGradesCount;
                let totalGrades = currentGradesCount;
                
                while ((totalValue / totalGrades) < targetAverage && gradesNeeded < 10) {
                    totalValue += desiredGrade; // Add the desired grade
                    totalGrades++;
                    gradesNeeded++;
                }
                
                if ((totalValue / totalGrades) < targetAverage) {
                    resultHTML = `<p>${getTranslation('targetTooHigh')}</p>`;
                } else {
                    resultHTML = `<p>${getTranslation('gradesNeeded')} ${gradesNeeded} x ${desiredGrade.toFixed(2)}</p>`;
                }
            } else if (neededGrade <= 0) {
                resultHTML = `<p>${getTranslation('targetTooLow')}</p>`;
            } else {
                resultHTML = `<p>${getTranslation('gradeNeeded')} ${neededGrade.toFixed(2)}</p>`;
            }
        }
        
        const targetResult = document.getElementById('target-result');
        targetResult.innerHTML = resultHTML;
        targetResult.style.display = 'block';
    },
    
    // Open goal calculator modal
    openGoalCalculator() {
        // Reset form
        document.getElementById('goal-average').value = '';
        document.getElementById('goal-result').style.display = 'none';
        document.getElementById('goal-result').innerHTML = '';
        
        // Show modal
        document.getElementById('goal-calculator-modal').classList.add('active');
        const overlay = document.querySelector('.overlay');
        overlay.style.display = 'block';
        setTimeout(() => overlay.classList.add('active'), 10);
    },
    
    // Calculate goal
    calculateGoal() {
        const goalAverage = parseFloat(document.getElementById('goal-average').value);
        const desiredGrade = parseFloat(document.getElementById('goal-desired-grade').value) || 10;
        
        if (!goalAverage || isNaN(goalAverage) || goalAverage < 0 || goalAverage > 10) {
            alert(getTranslation('invalidInput'));
            return;
        }
        
        const currentFinalAverage = this.calculateFinalAverage();
        const subjectsWithGrades = this.subjects.filter(subject => subject.grades.length > 0);
        const subjectsWithoutGrades = this.subjects.filter(subject => subject.grades.length === 0);
        
        let resultHTML = '';
        
        // If current average is already higher than goal
        if (currentFinalAverage >= goalAverage) {
            resultHTML = `<p>${getTranslation('targetTooLow')}</p>`;
        } 
        // If we have subjects without grades, suggest adding grades to those
        else if (subjectsWithoutGrades.length > 0) {
            const neededAverage = (goalAverage * (subjectsWithGrades.length + 1)) - (currentFinalAverage * subjectsWithGrades.length);
            
            if (neededAverage > desiredGrade) {
                // Need more than one subject
                const totalNeeded = goalAverage * this.subjects.length - currentFinalAverage * subjectsWithGrades.length;
                const averageNeeded = totalNeeded / subjectsWithoutGrades.length;
                
                if (averageNeeded > desiredGrade) {
                    resultHTML = `<p>${getTranslation('targetTooHigh')}</p>`;
                } else {
                    resultHTML = `<p>${getTranslation('targetResults').replace('{target}', goalAverage.toFixed(2))}</p>
                        <ul>`;
                    
                    subjectsWithoutGrades.forEach(subject => {
                        resultHTML += `<li>${getTranslation(subject.nameKey)}: ${averageNeeded.toFixed(2)}</li>`;
                    });
                    
                    resultHTML += `</ul>`;
                }
            } else {
                resultHTML = `<p>${getTranslation('targetResults').replace('{target}', goalAverage.toFixed(2))}</p>
                    <ul>
                        <li>${getTranslation(subjectsWithoutGrades[0].nameKey)}: ${neededAverage.toFixed(2)}</li>
                    </ul>`;
            }
        } 
        // If all subjects have grades, suggest improving the lowest ones
        else {
            // Sort subjects by average
            const sortedSubjects = [...this.subjects].sort((a, b) => {
                return this.calculateSubjectAverage(a) - this.calculateSubjectAverage(b);
            });
            
            // Take the 3 lowest subjects
            const lowestSubjects = sortedSubjects.slice(0, 3);
            
            // Calculate how much improvement needed
            const totalImprovement = (goalAverage - currentFinalAverage) * this.subjects.length;
            const improvementPerSubject = totalImprovement / 3;
            
            resultHTML = `<p>${getTranslation('targetResults').replace('{target}', goalAverage.toFixed(2))}</p>
                <ul>`;
            
            lowestSubjects.forEach(subject => {
                const currentSubjectAverage = this.calculateSubjectAverage(subject);
                const targetSubjectAverage = currentSubjectAverage + improvementPerSubject;
                const gradesCount = subject.grades.length;
                const neededGrade = (targetSubjectAverage * (gradesCount + 1)) - (currentSubjectAverage * gradesCount);
                
                if (neededGrade <= desiredGrade) {
                    resultHTML += `<li>${getTranslation(subject.nameKey)}: ${getTranslation('gradeNeeded')} ${neededGrade.toFixed(2)}</li>`;
                } else {
                    // Calculate how many desired grades needed
                    let gradesNeeded = 0;
                    let totalValue = currentSubjectAverage * gradesCount;
                    let totalGrades = gradesCount;
                    
                    while ((totalValue / totalGrades) < targetSubjectAverage && gradesNeeded < 10) {
                        totalValue += desiredGrade;
                        totalGrades++;
                        gradesNeeded++;
                    }
                    
                    if ((totalValue / totalGrades) < targetSubjectAverage) {
                        resultHTML += `<li>${getTranslation(subject.nameKey)}: ${getTranslation('targetTooHigh')}</li>`;
                    } else {
                        resultHTML += `<li>${getTranslation(subject.nameKey)}: ${getTranslation('gradesNeeded')} ${gradesNeeded} x ${desiredGrade.toFixed(2)}</li>`;
                    }
                }
            });
            
            resultHTML += `</ul>`;
        }
        
        const goalResult = document.getElementById('goal-result');
        goalResult.innerHTML = resultHTML;
        goalResult.style.display = 'block';
    },
    
    // Export data as JSON
    exportData() {
        // Create a formatted JSON object with all the data
        const exportData = {
            subjects: this.subjects,
            finalAverage: this.calculateFinalAverage(),
            exportDate: new Date().toISOString(),
            language: currentLanguage
        };
        
        // Convert to JSON string
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Create a blob and download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `grade-calculator-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },
    
    // Close all modals
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        const overlay = document.querySelector('.overlay');
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = app;
    
    // Hide loading screen after a short delay for better UX
    setTimeout(() => {
        app.init();
        
        // Hide loading screen with animation
        const loadingScreen = document.querySelector('.loading-screen');
        loadingScreen.classList.add('hidden');
        
        // Remove loading screen from DOM after animation completes
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 800);
});