# 우편번호 검색기 (ZipCode Finder)

크롬 브라우저 확장 프로그램으로, 웹사이트에서 우편번호를 쉽게 검색하고 입력할 수 있게 해주는 도구입니다.

## 주요 기능

- 주소 검색을 통한 우편번호 검색
- 자동 입력 필드 감지
- 우편번호 북마크 기능
- 네이버 검색 API를 활용한 정확한 우편번호 정보 제공

## 설치 방법

1. 이 저장소를 클론합니다:
```bash
git clone [repository-url]
```

2. 크롬 브라우저에서 `chrome://extensions` 페이지로 이동합니다.

3. 우측 상단의 "개발자 모드"를 활성화합니다.

4. "압축해제된 확장 프로그램을 로드합니다" 버튼을 클릭합니다.

5. 프로젝트 디렉토리를 선택합니다.

## 개발 환경 설정

1. 의존성 설치:
```bash
npm install
```

2. 테스트 실행:
```bash
npm test
```

## 프로젝트 구조

```
zipco/
├── images/              # 아이콘 이미지
├── manifest.json        # 크롬 확장 프로그램 설정
├── popup.html          # 팝업 UI
├── popup.js            # 팝업 로직
├── content.js          # 웹페이지 주입 스크립트
├── searchZipCode.js    # 우편번호 검색 모듈
├── styles.css          # 스타일시트
└── popup.test.js       # 테스트 코드
```

## 기술 스택

- JavaScript
- Chrome Extension API
- Jest (테스트)

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 