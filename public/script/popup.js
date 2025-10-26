let clickCount = 0;

const BtnScan = document.getElementById('btn-scan');
const closePopupBtn = document.getElementById('close-btn');
const popup = document.getElementById('popup');
const button = document.getElementById('close-btn');
const square = document.getElementById('action-one');

if (BtnScan && popup && button && square) {
  BtnScan.addEventListener('click', () => {
    popup.style.display = 'flex';
    square.style.display = 'none';
    clickCount = 0;
  });

  button.addEventListener('click', function () {
    clickCount++;
    if (clickCount === 1) {
      square.style.display = 'block';
    } else if (clickCount === 2) {
      popup.style.display = 'none';
    }
  });

  window.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  });
}
