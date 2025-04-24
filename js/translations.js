// Translations for the application
const translations = {
    en: {
        // App title and general
        appTitle: "Grade Calculator",
        finalAverage: "Final Average",
        totalSubjects: "Total Subjects",
        totalGrades: "Total Grades",
        goalCalculator: "Goal Calculator",
        importData: "Import Data",
        exportData: "Export Data",
        importFromFile: "Import from File",
        importFileDescription: "Select a previously exported JSON file to import your grades.",
        importFile: "Import File",
        importFromText: "Import from Text",
        importTextDescription: "Paste the exported JSON data here.",
        importText: "Import Text",
        importSuccess: "Data imported successfully!",
        importError: "Error importing data. Please check the format.",
        desiredGrade: "Desired Grade",
        selectTheme: "Select Theme",
        defaultTheme: "Default",
        oceanTheme: "Ocean",
        sunsetTheme: "Sunset",
        forestTheme: "Forest",
        lavenderTheme: "Lavender",
        loading: "Loading...",
        
        // Subject names
        italiano: "Italian",
        english: "English",
        arteEImmagine: "Art and Image",
        educazioneCivica: "Civic Education",
        francese: "French",
        geografia: "Geography",
        inglese: "English",
        matematica: "Math",
        musica: "Music",
        scienze: "Science",
        scienzeMotorie: "P.E. (Physical Ed.)",
        storia: "History",
        tecnologiaEInformatica: "Technology & CS",
        
        // Modal and form labels
        currentAverage: "Current Average",
        grades: "Grades",
        addGrade: "Add Grade",
        gradeValue: "Grade Value",
        description: "Description (optional)",
        
        // Hypothetical calculator
        hypotheticalCalculator: "Hypothetical Calculator",
        whatIfGrade: "What if I get this grade?",
        newSubjectAverage: "New Subject Average:",
        newFinalAverage: "New Final Average:",
        
        // Target calculator
        targetCalculator: "Target Calculator",
        targetAverage: "Target Average",
        calculate: "Calculate",
        targetFinalAverage: "Target Final Average",
        
        // Results and messages
        gradeNeeded: "Grade needed:",
        gradesNeeded: "Grades needed:",
        noGradesYet: "No grades yet",
        resetConfirmation: "Are you sure you want to reset all data? This cannot be undone.",
        resetSuccess: "All data has been reset successfully.",
        invalidInput: "Please enter a valid grade between 0 and 10.",
        targetTooHigh: "Target is too high to reach with one grade.",
        targetTooLow: "Target is already achieved.",
        targetResults: "To reach your target average of {target}, you need:",
        
        // Buttons and actions
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        cancel: "Cancel",
        confirm: "Confirm"
    },
    it: {
        // App title and general
        appTitle: "Calcolatore Voti",
        finalAverage: "Media Finale",
        totalSubjects: "Totale Materie",
        totalGrades: "Totale Voti",
        goalCalculator: "Calcolatore Obiettivo",
        importData: "Importa Dati",
        exportData: "Esporta Dati",
        importFromFile: "Importa da File",
        importFileDescription: "Seleziona un file JSON precedentemente esportato per importare i tuoi voti.",
        importFile: "Importa File",
        importFromText: "Importa da Testo",
        importTextDescription: "Incolla qui i dati JSON esportati.",
        importText: "Importa Testo",
        importSuccess: "Dati importati con successo!",
        importError: "Errore durante l'importazione dei dati. Controlla il formato.",
        desiredGrade: "Voto Desiderato",
        selectTheme: "Seleziona Tema",
        defaultTheme: "Predefinito",
        oceanTheme: "Oceano",
        sunsetTheme: "Tramonto",
        forestTheme: "Foresta",
        lavenderTheme: "Lavanda",
        loading: "Caricamento...",
        
        // Subject names
        italiano: "Italiano",
        english: "Inglese",
        arteEImmagine: "Arte e Immagine",
        educazioneCivica: "Educazione Civica",
        francese: "Francese",
        geografia: "Geografia",
        inglese: "Inglese",
        matematica: "Matematica",
        musica: "Musica",
        scienze: "Scienze",
        scienzeMotorie: "Scienze Motorie",
        storia: "Storia",
        tecnologiaEInformatica: "Tecnologia e Informatica",
        
        // Modal and form labels
        currentAverage: "Media Attuale",
        grades: "Voti",
        addGrade: "Aggiungi Voto",
        gradeValue: "Valore Voto",
        description: "Descrizione (opzionale)",
        
        // Hypothetical calculator
        hypotheticalCalculator: "Calcolatore Ipotetico",
        whatIfGrade: "E se prendessi questo voto?",
        newSubjectAverage: "Nuova Media Materia:",
        newFinalAverage: "Nuova Media Finale:",
        
        // Target calculator
        targetCalculator: "Calcolatore Obiettivo",
        targetAverage: "Media Obiettivo",
        calculate: "Calcola",
        targetFinalAverage: "Media Finale Obiettivo",
        
        // Results and messages
        gradeNeeded: "Voto necessario:",
        gradesNeeded: "Voti necessari:",
        noGradesYet: "Ancora nessun voto",
        resetConfirmation: "Sei sicuro di voler resettare tutti i dati? Questa azione non può essere annullata.",
        resetSuccess: "Tutti i dati sono stati resettati con successo.",
        invalidInput: "Inserisci un voto valido tra 0 e 10.",
        targetTooHigh: "L'obiettivo è troppo alto da raggiungere con un solo voto.",
        targetTooLow: "L'obiettivo è già stato raggiunto.",
        targetResults: "Per raggiungere la tua media obiettivo di {target}, hai bisogno di:",
        
        // Buttons and actions
        edit: "Modifica",
        delete: "Elimina",
        save: "Salva",
        cancel: "Annulla",
        confirm: "Conferma"
    }
};

// Default language
let currentLanguage = localStorage.getItem('language') || 'en';

// Function to translate the UI
function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLanguage);
    });
}

// Function to get translation for a key
function getTranslation(key) {
    return translations[currentLanguage][key] || key;
}

// Function to switch language
function switchLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        translateUI();
        
        // If we have subjects loaded, update their names
        if (window.app && window.app.subjects) {
            window.app.renderSubjects();
        }
    }
}

// Initialize language buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchLanguage(btn.getAttribute('data-lang'));
        });
    });
    
    // Initial translation
    translateUI();
});