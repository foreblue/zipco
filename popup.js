/**
 * 주소로 우편번호를 검색하는 함수
 * @param {string} address - 검색할 주소
 * @param {HTMLElement} searchResults - 검색 결과를 표시할 요소
 * @returns {Promise<void>}
 */
async function searchZipCode(address, searchResults) {
  try {
    // 네이버 검색 URL 생성
    const searchUrl = `https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=${encodeURIComponent(address + ' 우편번호')}`;
    
    // 네이버 검색 결과 요청
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error('검색 결과를 가져오는데 실패했습니다.');
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 우편번호 테이블 찾기
    const table = doc.querySelector('table');
    if (!table) {
      searchResults.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
      return;
    }

    // 테이블의 행들을 찾아서 주소와 우편번호 추출
    const rows = table.querySelectorAll('tr');
    const results = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        const addressText = cells[0].textContent.trim();
        const zipCodeText = cells[1].textContent.trim();
        const zipCode = zipCodeText.replace(/[^0-9]/g, '');
        
        if (zipCode && /^\d{5}$/.test(zipCode)) {
          results.push({
            zipCode,
            address: addressText
          });
        }
      }
    });

    // 결과 표시
    if (results.length > 0) {
      searchResults.innerHTML = results.map(result => `
        <div class="result-item" data-zipcode="${result.zipCode}" data-address="${result.address}">
          <div class="zip-code">${result.zipCode}</div>
          <div class="address">${result.address}</div>
          <div class="button-group">
            <button class="copy-btn">복사</button>
            <button class="favorite-btn">즐겨찾기</button>
          </div>
        </div>
      `).join('');
    } else {
      searchResults.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
    }
  } catch (error) {
    console.error('우편번호 검색 중 오류 발생:', error);
    searchResults.innerHTML = `<div class="error">오류가 발생했습니다: ${error.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const addressInput = document.getElementById('addressInput');
  const searchButton = document.getElementById('searchButton');
  const searchResults = document.getElementById('searchResults');
  const favoritesList = document.getElementById('favoritesList');

  // 즐겨찾기 목록 로드
  loadFavorites();

  // 검색 버튼 클릭 이벤트
  searchButton.addEventListener('click', async () => {
    const address = addressInput.value.trim();
    if (!address) {
      searchResults.innerHTML = '<div class="error">주소를 입력해주세요.</div>';
      return;
    }
    await searchZipCode(address, searchResults);
  });

  // Enter 키 이벤트
  addressInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const address = addressInput.value.trim();
      if (!address) {
        searchResults.innerHTML = '<div class="error">주소를 입력해주세요.</div>';
        return;
      }
      await searchZipCode(address, searchResults);
    }
  });

  // 검색 결과 버튼 이벤트 위임
  searchResults.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const resultItem = button.closest('.result-item');
    if (!resultItem) return;

    const zipCode = resultItem.dataset.zipcode;
    const address = resultItem.dataset.address;

    if (button.classList.contains('copy-btn')) {
      await copyToClipboard(zipCode, button);
    } else if (button.classList.contains('favorite-btn')) {
      await addToFavorites(address, zipCode);
    }
  });

  // 클립보드 복사
  async function copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      const originalText = button.textContent;
      button.textContent = '복사됨!';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 1000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('클립보드 복사에 실패했습니다.');
    }
  }

  // 즐겨찾기 추가
  async function addToFavorites(address, zipCode) {
    try {
      const favorites = await getFavorites();
      // 중복 체크
      if (favorites.some(fav => fav.address === address && fav.zipCode === zipCode)) {
        alert('이미 즐겨찾기에 추가되어 있습니다.');
        return;
      }
      favorites.push({ address, zipCode });
      await chrome.storage.local.set({ favorites });
      loadFavorites();
      alert('즐겨찾기에 추가되었습니다.');
    } catch (error) {
      console.error('즐겨찾기 추가 실패:', error);
      alert('즐겨찾기 추가에 실패했습니다.');
    }
  }

  // 즐겨찾기 목록 로드
  async function loadFavorites() {
    const favorites = await getFavorites();
    favoritesList.innerHTML = '';
    
    favorites.forEach((favorite, index) => {
      const div = document.createElement('div');
      div.className = 'favorite-item';
      div.dataset.index = index;
      div.innerHTML = `
        <div>
          <div class="address">${favorite.address}</div>
          <div class="zip-code">${favorite.zipCode}</div>
        </div>
        <div class="button-group">
          <button class="copy-btn">복사</button>
          <button class="delete-btn">삭제</button>
        </div>
      `;
      favoritesList.appendChild(div);
    });
  }

  // 즐겨찾기 버튼 이벤트 위임
  favoritesList.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const favoriteItem = button.closest('.favorite-item');
    if (!favoriteItem) return;

    const index = parseInt(favoriteItem.dataset.index);
    const zipCode = favoriteItem.querySelector('.zip-code').textContent;

    if (button.classList.contains('copy-btn')) {
      await copyToClipboard(zipCode, button);
    } else if (button.classList.contains('delete-btn')) {
      await removeFavorite(index);
    }
  });

  // 즐겨찾기 삭제
  async function removeFavorite(index) {
    try {
      const favorites = await getFavorites();
      favorites.splice(index, 1);
      await chrome.storage.local.set({ favorites });
      loadFavorites();
      alert('즐겨찾기에서 삭제되었습니다.');
    } catch (error) {
      console.error('즐겨찾기 삭제 실패:', error);
      alert('즐겨찾기 삭제에 실패했습니다.');
    }
  }

  // 즐겨찾기 목록 가져오기
  async function getFavorites() {
    const result = await chrome.storage.local.get('favorites');
    return result.favorites || [];
  }
});