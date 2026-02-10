// Simple interaction for the portfolio page

document.addEventListener("DOMContentLoaded", () => {
  const giftButton = document.querySelector("#thank-you-section button");

  if (giftButton) {
    giftButton.addEventListener("click", () => {
      alert("🎁 Thank you for visiting my portfolio! More interactive content is coming soon.");
    });
  }
});

