const { searchZipCode } = require('./searchZipCode');

document.addEventListener('DOMContentLoaded', () => {
  const addressInput = document.getElementById('addressInput');
  const searchButton = document.getElementById('searchButton');
  const searchResults = document.getElementById('searchResults');
  const favoritesList = document.getElementById('favoritesList');

  // 즐겨찾기 목록 로드
  loadFavorites();

  // 검색 버튼 클릭 이벤트
  searchButton.addEventListener('click', () => {
    const address = addressInput.value.trim();
    if (address) {
      searchZipCode(address, searchResults);
    }
  });

  // Enter 키 이벤트
  addressInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const address = addressInput.value.trim();
      if (address) {
        searchZipCode(address, searchResults);
      }
    }
  });

  // 클립보드 복사
  window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('우편번호가 복사되었습니다.');
    });
  };

  // 즐겨찾기 추가
  window.addToFavorites = async (address, zipCode) => {
    const favorites = await getFavorites();
    favorites.push({ address, zipCode });
    await chrome.storage.local.set({ favorites });
    loadFavorites();
  };

  // 즐겨찾기 목록 로드
  async function loadFavorites() {
    const favorites = await getFavorites();
    favoritesList.innerHTML = '';
    
    favorites.forEach((favorite, index) => {
      const div = document.createElement('div');
      div.className = 'favorite-item';
      div.innerHTML = `
        <div>
          <div>${favorite.address}</div>
          <div>우편번호: ${favorite.zipCode}</div>
        </div>
        <button onclick="removeFavorite(${index})">삭제</button>
      `;
      favoritesList.appendChild(div);
    });
  }

  // 즐겨찾기 삭제
  window.removeFavorite = async (index) => {
    const favorites = await getFavorites();
    favorites.splice(index, 1);
    await chrome.storage.local.set({ favorites });
    loadFavorites();
  };

  // 즐겨찾기 목록 가져오기
  async function getFavorites() {
    const result = await chrome.storage.local.get('favorites');
    return result.favorites || [];
  }
});

module.exports = {
  searchZipCode
}; 