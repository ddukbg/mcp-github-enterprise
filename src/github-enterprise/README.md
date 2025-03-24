# GitHub Enterprise MCP 서버

GitHub Enterprise API와의 통합을 위한 MCP(Model Context Protocol) 서버입니다. 이 서버는 GitHub Enterprise에 저장된 저장소, 이슈, PR 등의 정보를 Cursor에서 쉽게 접근할 수 있도록 MCP 인터페이스를 제공합니다.

## 주요 기능

- GitHub Enterprise 인스턴스에 호스팅된 저장소 목록 조회
- 저장소 세부 정보 조회
- 엔터프라이즈 통계 정보 조회
- 향상된 오류 처리 및 사용자 친화적인 응답 형식

## 시작하기

### 필수 조건

- Node.js 18 이상
- GitHub Enterprise 인스턴스에 대한 접근 권한
- 개인 액세스 토큰(PAT)

### 설치 및 설정

1. 환경 변수 설정:

```bash
# GitHub Enterprise API URL
export GITHUB_ENTERPRISE_URL="https://github.your-company.com/api/v3"

# GitHub 개인 액세스 토큰
export GITHUB_TOKEN="your_personal_access_token"
```

2. 패키지 설치:

```bash
npm install
```

3. 빌드:

```bash
npm run build
```

4. 서버 시작:

```bash
# STDIO 모드 (Cursor와 직접 통합)
npm start

# HTTP 모드 (디버깅용)
node dist/index.js --transport http
```

## HTTP 모드에서 사용 가능한 추가 옵션

- `--debug`: 디버그 로깅 활성화
- `--github-enterprise-url <URL>`: GitHub Enterprise API URL 설정
- `--token <TOKEN>`: GitHub 개인 액세스 토큰 설정

## API 개선 사항

- 유연한 API URL 설정 (다양한 환경 변수 및 명령행 인자 지원)
- 강화된 오류 처리 및 타임아웃 관리
- 사용자 친화적인 응답 형식 및 메시지

## 라이센스

ISC 