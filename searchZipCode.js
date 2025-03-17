// 우편번호 검색 함수
async function searchZipCode(address, searchResults) {
  try {
    // 네이버 검색 URL 생성
    const searchUrl = `https://search.naver.com/search.naver?where=nexearch&ie=utf8&X_CSA=address_search&query=${encodeURIComponent(address + ' 우편번호')}`;
    
    // CORS 우회를 위한 프록시 서버 사용
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(proxyUrl + encodeURIComponent(searchUrl));
    const html = await response.text();
    
    // HTML 파싱
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 우편번호 테이블 찾기
    const table = doc.querySelector('table');
    if (!table) {
      searchResults.innerHTML = '<p>검색 결과가 없습니다.</p>';
      return;
    }

    // 결과 배열 생성
    const results = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        const addressText = cells[0].textContent.trim();
        const zipCode = cells[1].textContent.trim();
        if (zipCode && /^\d{5}$/.test(zipCode)) {
          results.push({
            text: addressText,
            zipcode: zipCode
          });
        }
      }
    });

    displayResults(results, searchResults);
  } catch (error) {
    console.error('우편번호 검색 중 오류 발생:', error);
    searchResults.innerHTML = '<p>검색 중 오류가 발생했습니다.</p>';
  }
}

// 검색 결과 표시
function displayResults(results, searchResults) {
  searchResults.innerHTML = '';
  
  if (!results || results.length === 0) {
    searchResults.innerHTML = '<p>검색 결과가 없습니다.</p>';
    return;
  }

  results.forEach(result => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
      <div>${result.text}</div>
      <div>우편번호: ${result.zipcode}</div>
      <button onclick="copyToClipboard('${result.zipcode}')">복사</button>
      <button onclick="addToFavorites('${result.text}', '${result.zipcode}')">즐겨찾기</button>
    `;
    searchResults.appendChild(div);
  });
}

module.exports = {
  searchZipCode,
  displayResults
}; 