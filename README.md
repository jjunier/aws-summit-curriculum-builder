# AWS Summit Seoul 2026 일정 빌더

> AWS Summit Seoul 2026의 5월 20일 Industry Day와 5월 21일 AI Day 세션을 직접 조합해 나만의 참석 일정을 구성할 수 있는 웹 기반 커리큘럼 빌더입니다.

세션을 추가하면 타임테이블에 자동으로 반영되며, 같은 날짜 내 시간 충돌 여부를 확인하면서 개인 맞춤형 Summit 참석 계획표를 만들 수 있습니다.

## 파일 구성

```text
aws-summit-curriculum-builder/
├── index.html
├── styles.css
├── app.js
├── sessions.json
└── README.md
````

## 구동 방법

본 프로젝트는 `fetch("./sessions.json")`를 사용해 세션 데이터를 불러옵니다.
따라서 `index.html` 파일을 브라우저에서 직접 더블클릭하는 방식보다는 **로컬 서버로 실행하는 방식**을 권장합니다.

### 방법 1. Python 로컬 서버 사용

프로젝트 폴더로 이동합니다.

```bash
cd aws-summit-curriculum-builder
```

Python 내장 HTTP 서버를 실행합니다.

```bash
python -m http.server 8000
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:8000
```

### 방법 2. VS Code Live Server 사용

1. VS Code에서 프로젝트 폴더를 엽니다.
2. Live Server 확장을 설치합니다.
3. `index.html` 파일을 우클릭합니다.
4. `Open with Live Server`를 선택합니다.
5. 브라우저에서 페이지가 실행되는지 확인합니다.

## 데이터 파일

세션 데이터는 `sessions.json` 파일에서 관리합니다.

`sessions.json`은 배열 형태의 JSON 파일이며, 각 세션은 아래 필드를 가집니다.

```json
{
  "id": "ANT305",
  "date": "2026-05-21",
  "time": "11:10 - 11:50",
  "start": "11:10",
  "end": "11:50",
  "title": "에이전틱 AI를 위한 데이터 실무 가이드",
  "speaker": "AWS",
  "language": "Korean",
  "difficulty": "Intermediate",
  "topic": "Data",
  "relevance": "AI-ready data, 데이터 품질, 메타데이터 관점에서 핵심 세션입니다."
}
```

### 필드 설명

| 필드           | 설명                  |
| ------------ | ------------------- |
| `id`         | 세션 코드               |
| `date`       | 세션 날짜               |
| `time`       | 화면에 표시할 시간 범위       |
| `start`      | 타임테이블 배치에 사용할 시작 시간 |
| `end`        | 타임테이블 배치에 사용할 종료 시간 |
| `title`      | 세션 제목               |
| `speaker`    | 발표자 또는 발표 기업        |
| `language`   | 발표 언어               |
| `difficulty` | 세션 난이도              |
| `topic`      | 세션 분류               |
| `relevance`  | 세션 설명 또는 추천 사유      |

## 세션 분류 기준

현재 세션은 다음 기준으로 분류되어 있습니다.

```text
Data, Platform, Ops, Security, Career
```

각 분류의 의미는 다음과 같습니다.

| 분류         | 기준                                                             |
| ---------- | -------------------------------------------------------------- |
| `Data`     | 데이터 플랫폼, 분석 DB, CDC, 레이크하우스, 데이터 카탈로그, 검색, AI-ready data 관련 세션 |
| `Platform` | EKS, 서버리스, Lambda, HyperPod, Trainium, IaC 등 실행 인프라와 플랫폼 관련 세션 |
| `Ops`      | AIOps, Observability, 모니터링, 장애 대응, SRE, MLOps, 평가·개선 관련 세션     |
| `Security` | KMS, CloudHSM, Zero Trust, AI 보안, 심층방어, 보안 운영 관련 세션            |
| `Career`   | 기조연설, 커뮤니티, 커리어 성장, 네트워킹 관련 세션                                 |

## 난이도 기준

`difficulty` 값은 다음 중 하나를 사용합니다.

```text
Foundational, Intermediate, Advanced, Expert
```

| 난이도            | 의미                        |
| -------------- | ------------------------- |
| `Foundational` | 입문 또는 전체 흐름 이해 중심         |
| `Intermediate` | 실무 적용 사례와 구조 이해 중심        |
| `Advanced`     | 아키텍처, 운영, 최적화 등 심화 주제 중심  |
| `Expert`       | 고난도 인프라, 대규모 운영, 전문 기술 중심 |

## 주요 기능

* 5월 20일 / 5월 21일 전체 세션 목록 제공
* 날짜별 필터
* 난이도별 필터
* 주제별 필터
* 세션명, 코드, 발표 주체 기반 키워드 검색
* 세션 추가 및 제거
* 2일 타임 블록 시간표 자동 반영
* 같은 날짜 내 시간 충돌 감지
* 추천 커리큘럼 1 적용
* 추천 커리큘럼 2 적용
* 라이트 모드 / 다크 모드 전환
* JSON 내보내기
* CSV 내보내기

## 추천 커리큘럼

페이지에는 두 가지 추천 커리큘럼 버튼이 제공됩니다.

### 추천 커리큘럼 1

기존 추천안으로, 데이터·AI·운영·플랫폼 관점을 균형 있게 포함한 2일 커리큘럼입니다.

### 추천 커리큘럼 2

20일 일정은 추천 커리큘럼 1과 동일하게 유지하고, 21일 일정은 데이터 파이프라인·플랫폼 중심 대안 커리큘럼으로 구성합니다.

특히 아래 주제에 관심이 있는 사용자에게 적합합니다.

* 이커머스 데이터 파이프라인
* CDC
* 레이크하우스
* 데이터 카탈로그
* ClickHouse 기반 분석 시스템
* OpenSearch 기반 검색·로그·RAG 데이터 계층
* MLOps 및 데이터 품질 관리

## 개발 및 수정 참고

세션 데이터를 수정하려면 `sessions.json` 파일을 편집하면 됩니다.

새 세션을 추가할 때는 최소한 아래 필드를 포함해야 합니다.

```json
{
  "id": "SESSION_ID",
  "date": "2026-05-20",
  "time": "11:10 - 11:50",
  "start": "11:10",
  "end": "11:50",
  "title": "세션 제목",
  "speaker": "발표자",
  "language": "Korean",
  "difficulty": "Intermediate",
  "topic": "Data",
  "relevance": "세션 설명"
}
```

세션 목록은 `app.js`의 정렬 로직에 따라 날짜와 시작 시간 기준으로 나열됩니다.

## 주의 사항

* `sessions.json`을 정상적으로 불러오려면 로컬 서버 환경에서 실행하는 것을 권장합니다.
* 브라우저에서 `index.html`을 직접 열면 보안 정책 때문에 `sessions.json` 로딩이 실패할 수 있습니다.
* 시간표 위치 계산은 `start`, `end` 값을 기준으로 동작하므로 시간 형식은 `HH:mm` 형태를 유지해야 합니다.