// Proje kartlarına tıklandığında çalışan basit bir etkileşim
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('click', () => {
        alert("Project details coming soon! This interaction is handled by main.js.");
    });
});


 