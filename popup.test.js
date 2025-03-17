// Mock fetch and DOMParser
global.fetch = jest.fn();
global.DOMParser = jest.fn();

describe('searchZipCode', () => {
  let searchZipCode;
  let mockSearchResults;
  
  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="searchResults"></div>
    `;
    mockSearchResults = document.getElementById('searchResults');
    
    // Import the function
    searchZipCode = require('./searchZipCode').searchZipCode;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('성공적으로 우편번호를 검색하고 결과를 표시해야 함', async () => {
    // Mock HTML response
    const mockHtml = `
      <table>
        <tr>
          <td>서울특별시 강남구 테스트로 123</td>
          <td>12345</td>
        </tr>
      </table>
    `;
    
    // Mock fetch response
    global.fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml)
    });

    // Mock DOMParser result
    const mockDoc = {
      querySelector: jest.fn().mockReturnValue({
        querySelectorAll: jest.fn().mockReturnValue([
          {
            querySelectorAll: jest.fn().mockReturnValue([
              { textContent: '서울특별시 강남구 테스트로 123' },
              { textContent: '12345' }
            ])
          }
        ])
      })
    };
    
    global.DOMParser.mockImplementation(() => ({
      parseFromString: jest.fn().mockReturnValue(mockDoc)
    }));

    await searchZipCode('테스트 주소', mockSearchResults);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.allorigins.win/raw?url=')
    );
    expect(mockSearchResults.innerHTML).toContain('서울특별시 강남구 테스트로 123');
    expect(mockSearchResults.innerHTML).toContain('12345');
  });

  test('검색 결과가 없을 때 적절한 메시지를 표시해야 함', async () => {
    // Mock HTML response without table
    const mockHtml = '<div>검색 결과 없음</div>';
    
    // Mock fetch response
    global.fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml)
    });

    // Mock DOMParser result with no table
    const mockDoc = {
      querySelector: jest.fn().mockReturnValue(null)
    };
    
    global.DOMParser.mockImplementation(() => ({
      parseFromString: jest.fn().mockReturnValue(mockDoc)
    }));

    await searchZipCode('존재하지 않는 주소', mockSearchResults);

    expect(mockSearchResults.innerHTML).toBe('<p>검색 결과가 없습니다.</p>');
  });

  test('에러 발생 시 에러 메시지를 표시해야 함', async () => {
    // Mock fetch error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await searchZipCode('테스트 주소', mockSearchResults);

    expect(mockSearchResults.innerHTML).toBe('<p>검색 중 오류가 발생했습니다.</p>');
  });

  test('우편번호가 5자리가 아닌 경우 결과에서 제외해야 함', async () => {
    // Mock HTML response with invalid zipcode
    const mockHtml = `
      <table>
        <tr>
          <td>서울특별시 강남구 테스트로 123</td>
          <td>1234</td>
        </tr>
      </table>
    `;
    
    // Mock fetch response
    global.fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml)
    });

    // Mock DOMParser result
    const mockDoc = {
      querySelector: jest.fn().mockReturnValue({
        querySelectorAll: jest.fn().mockReturnValue([
          {
            querySelectorAll: jest.fn().mockReturnValue([
              { textContent: '서울특별시 강남구 테스트로 123' },
              { textContent: '1234' }
            ])
          }
        ])
      })
    };
    
    global.DOMParser.mockImplementation(() => ({
      parseFromString: jest.fn().mockReturnValue(mockDoc)
    }));

    await searchZipCode('테스트 주소', mockSearchResults);

    expect(mockSearchResults.innerHTML).toBe('<p>검색 결과가 없습니다.</p>');
  });
}); 