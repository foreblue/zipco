// 우편번호 입력 필드 감지 및 자동 입력 기능
function detectZipCodeFields() {
  const zipCodeInputs = document.querySelectorAll('input[type="text"], input[type="number"]');
  
  zipCodeInputs.forEach(input => {
    // 우편번호 입력 필드로 보이는 요소들 감지
    if (isZipCodeField(input)) {
      addZipCodeButton(input);
    }
  });
}

// 우편번호 입력 필드인지 확인
function isZipCodeField(input) {
  const fieldName = input.name.toLowerCase();
  const fieldId = input.id.toLowerCase();
  const fieldPlaceholder = input.placeholder.toLowerCase();
  
  const zipCodeKeywords = ['zip', 'zipcode', 'postal', 'postalcode', '우편번호', '우편'];
  
  return zipCodeKeywords.some(keyword => 
    fieldName.includes(keyword) || 
    fieldId.includes(keyword) || 
    fieldPlaceholder.includes(keyword)
  );
}

// 우편번호 검색 버튼 추가
function addZipCodeButton(input) {
  const button = document.createElement('button');
  button.textContent = '우편번호 검색';
  button.className = 'zipcode-search-button';
  button.style.cssText = `
    margin-left: 8px;
    padding: 4px 8px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  
  button.addEventListener('click', () => {
    // 팝업에서 우편번호 검색 결과를 받아오기 위한 메시지 전송
    chrome.runtime.sendMessage({ action: 'openZipCodeSearch' }, response => {
      if (response && response.zipCode) {
        input.value = response.zipCode;
        // input 이벤트 발생시켜 폼 유효성 검사 등이 작동하도록 함
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
  
  input.parentNode.insertBefore(button, input.nextSibling);
}

// 페이지 로드 시 우편번호 입력 필드 감지
document.addEventListener('DOMContentLoaded', detectZipCodeFields);

// 동적으로 추가되는 요소들도 감지
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      detectZipCodeFields();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
}); 