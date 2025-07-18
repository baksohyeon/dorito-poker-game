# 포커 게임 프로젝트 디렉터리 구조 (TypeScript)

```
poker-game/
├── README.md
├── package.json                   # 루트 패키지 (모노레포 관리)
├── tsconfig.json                  # 루트 TypeScript 설정
├── docker-compose.yml
├── .env.example
├── .gitignore
├── turbo.json                     # Turbo 빌드 설정 (옵션)
│
├── packages/                      # 공유 패키지들
│   ├── shared/                   # 공통 타입, 유틸리티
│   │   ├── src/
│   │   │   ├── types/            # 공통 타입 정의
│   │   │   │   ├── game.types.ts
│   │   │   │   ├── player.types.ts
│   │   │   │   ├── table.types.ts
│   │   │   │   ├── socket.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/            # 공통 유틸리티
│   │   │   │   ├── snowflake.ts
│   │   │   │   ├── consistent-hash.ts
│   │   │   │   ├── validation.ts
│   │   │   │   ├── crypto.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/        # 상수 정의
│   │   │   │   ├── game.constants.ts
│   │   │   │   ├── error.constants.ts
│   │   │   │   └── index.ts
│   │   │   ├── interfaces/       # 인터페이스 정의
│   │   │   │   ├── game.interface.ts
│   │   │   │   ├── server.interface.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── dist/                 # 빌드 결과물
│   │
│   ├── database/                 # 데이터베이스 관련
│   │   ├── src/
│   │   │   ├── models/           # Prisma/TypeORM 모델
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── game.model.ts
│   │   │   │   ├── table.model.ts
│   │   │   │   └── index.ts
│   │   │   ├── repositories/     # 레포지토리 패턴
│   │   │   │   ├── user.repository.ts
│   │   │   │   ├── game.repository.ts
│   │   │   │   └── index.ts
│   │   │   ├── migrations/       # DB 마이그레이션
│   │   │   └── seeds/           # 시드 데이터
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── logger/                   # 로깅 시스템
│       ├── src/
│       │   ├── logger.ts
│       │   ├── transports/
│       │   └── formatters/
│       ├── package.json
│       └── tsconfig.json
│
├── apps/                         # 각 서비스별 애플리케이션
│   ├── master-server/           # Master Server
│   │   ├── src/
│   │   │   ├── index.ts         # 엔트리 포인트
│   │   │   ├── server.ts        # Express 서버 설정
│   │   │   ├── controllers/     # API 컨트롤러
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── player.controller.ts
│   │   │   │   ├── table.controller.ts
│   │   │   │   ├── matching.controller.ts
│   │   │   │   └── index.ts
│   │   │   ├── services/        # 비즈니스 로직
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── player.service.ts
│   │   │   │   ├── matching.service.ts
│   │   │   │   ├── server-manager.service.ts
│   │   │   │   ├── hash-ring.service.ts
│   │   │   │   └── index.ts
│   │   │   ├── middleware/      # 미들웨어
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── rate-limit.middleware.ts
│   │   │   │   ├── validation.middleware.ts
│   │   │   │   ├── error.middleware.ts
│   │   │   │   └── index.ts
│   │   │   ├── routes/          # API 라우트
│   │   │   │   ├── api.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── player.routes.ts
│   │   │   │   ├── table.routes.ts
│   │   │   │   └── index.ts
│   │   │   ├── types/           # 서버별 타입
│   │   │   │   ├── request.types.ts
│   │   │   │   ├── response.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── config/          # 설정 파일
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   ├── server.config.ts
│   │   │   │   └── index.ts
│   │   │   └── utils/           # 서버별 유틸리티
│   │   │       ├── jwt.util.ts
│   │   │       ├── response.util.ts
│   │   │       └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── dist/                # 빌드 결과물
│   │
│   ├── dedicated-server/        # Dedicated Game Server
│   │   ├── src/
│   │   │   ├── index.ts         # 엔트리 포인트
│   │   │   ├── server.ts        # WebSocket 서버
│   │   │   ├── game/            # 게임 로직
│   │   │   │   ├── poker-table.ts
│   │   │   │   ├── game-state.ts
│   │   │   │   ├── player.ts
│   │   │   │   ├── card.ts
│   │   │   │   ├── deck.ts
│   │   │   │   ├── hand-evaluator.ts
│   │   │   │   ├── betting.ts
│   │   │   │   ├── game-loop.ts
│   │   │   │   └── index.ts
│   │   │   ├── managers/        # 매니저 클래스들
│   │   │   │   ├── table-manager.ts
│   │   │   │   ├── connection-manager.ts
│   │   │   │   ├── event-manager.ts
│   │   │   │   ├── session-manager.ts
│   │   │   │   └── index.ts
│   │   │   ├── handlers/        # 이벤트 핸들러
│   │   │   │   ├── base.handler.ts
│   │   │   │   ├── connection.handler.ts
│   │   │   │   ├── game-action.handler.ts
│   │   │   │   ├── chat.handler.ts
│   │   │   │   ├── reconnect.handler.ts
│   │   │   │   └── index.ts
│   │   │   ├── events/          # 이벤트 시스템
│   │   │   │   ├── event-store.ts
│   │   │   │   ├── event-bus.ts
│   │   │   │   ├── event-types.ts
│   │   │   │   ├── event.interface.ts
│   │   │   │   └── index.ts
│   │   │   ├── security/        # 보안 관련
│   │   │   │   ├── anti-cheat.ts
│   │   │   │   ├── card-shuffle.ts
│   │   │   │   ├── packet-validator.ts
│   │   │   │   ├── rate-limiter.ts
│   │   │   │   └── index.ts
│   │   │   ├── types/           # 서버별 타입
│   │   │   │   ├── socket.types.ts
│   │   │   │   ├── game-event.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── config/
│   │   │   │   ├── game.config.ts
│   │   │   │   ├── server.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   └── index.ts
│   │   │   └── utils/
│   │   │       ├── socket.util.ts
│   │   │       ├── game.util.ts
│   │   │       └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── dist/
│   │
│   ├── ai-server/               # AI 분석 서버
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── server.ts
│   │   │   ├── analysis/        # AI 분석 엔진
│   │   │   │   ├── pattern-analyzer.ts
│   │   │   │   ├── probability-calculator.ts
│   │   │   │   ├── strategy-recommender.ts
│   │   │   │   ├── player-model.ts
│   │   │   │   ├── monte-carlo.ts
│   │   │   │   └── index.ts
│   │   │   ├── workers/         # 워커 스레드
│   │   │   │   ├── analysis-worker.ts
│   │   │   │   ├── worker-pool.ts
│   │   │   │   ├── task-queue.ts
│   │   │   │   └── index.ts
│   │   │   ├── models/          # 머신러닝 모델
│   │   │   │   ├── tensorflow/
│   │   │   │   │   ├── player-behavior.model.ts
│   │   │   │   │   └── hand-prediction.model.ts
│   │   │   │   ├── data/
│   │   │   │   │   ├── training-data.ts
│   │   │   │   │   └── feature-extractor.ts
│   │   │   │   └── index.ts
│   │   │   ├── types/           # AI 관련 타입
│   │   │   │   ├── analysis.types.ts
│   │   │   │   ├── model.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── config/
│   │   │   │   ├── ai.config.ts
│   │   │   │   └── index.ts
│   │   │   └── utils/
│   │   │       ├── math.util.ts
│   │   │       ├── cache.util.ts
│   │   │       └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── dist/
│   │
│   └── web-client/              # 웹 클라이언트 (React + TypeScript)
│       ├── public/
│       │   ├── index.html
│       │   ├── favicon.ico
│       │   └── assets/
│       │       ├── images/
│       │       │   ├── cards/
│       │       │   ├── chips/
│       │       │   └── ui/
│       │       ├── sounds/
│       │       │   ├── card-flip.mp3
│       │       │   ├── chip-bet.mp3
│       │       │   └── notification.mp3
│       │       └── fonts/
│       ├── src/
│       │   ├── index.tsx
│       │   ├── App.tsx
│       │   ├── components/      # React 컴포넌트
│       │   │   ├── game/
│       │   │   │   ├── GameTable.tsx
│       │   │   │   ├── PlayerSeat.tsx
│       │   │   │   ├── CommunityCards.tsx
│       │   │   │   ├── BettingActions.tsx
│       │   │   │   ├── HandHistory.tsx
│       │   │   │   └── index.ts
│       │   │   ├── ui/          # 공통 UI 컴포넌트
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Modal.tsx
│       │   │   │   ├── Loading.tsx
│       │   │   │   ├── Notification.tsx
│       │   │   │   └── index.ts
│       │   │   ├── lobby/       # 로비 관련
│       │   │   │   ├── TableList.tsx
│       │   │   │   ├── CreateTable.tsx
│       │   │   │   ├── PlayerProfile.tsx
│       │   │   │   └── index.ts
│       │   │   ├── ai/          # AI 조언 관련
│       │   │   │   ├── StrategyPanel.tsx
│       │   │   │   ├── PatternAnalysis.tsx
│       │   │   │   ├── ProbabilityDisplay.tsx
│       │   │   │   └── index.ts
│       │   │   └── layout/      # 레이아웃
│       │   │       ├── Header.tsx
│       │   │       ├── Sidebar.tsx
│       │   │       ├── Footer.tsx
│       │   │       └── index.ts
│       │   ├── hooks/           # Custom React Hooks
│       │   │   ├── useSocket.ts
│       │   │   ├── useGame.ts
│       │   │   ├── useAuth.ts
│       │   │   ├── useAI.ts
│       │   │   └── index.ts
│       │   ├── services/        # API 서비스
│       │   │   ├── api.service.ts
│       │   │   ├── socket.service.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── game.service.ts
│       │   │   └── index.ts
│       │   ├── store/           # 상태 관리 (Redux/Zustand)
│       │   │   ├── slices/
│       │   │   │   ├── auth.slice.ts
│       │   │   │   ├── game.slice.ts
│       │   │   │   ├── ui.slice.ts
│       │   │   │   └── index.ts
│       │   │   ├── store.ts
│       │   │   └── index.ts
│       │   ├── types/           # 클라이언트 타입
│       │   │   ├── component.types.ts
│       │   │   ├── api.types.ts
│       │   │   ├── store.types.ts
│       │   │   └── index.ts
│       │   ├── utils/           # 클라이언트 유틸리티
│       │   │   ├── formatting.util.ts
│       │   │   ├── validation.util.ts
│       │   │   ├── sound.util.ts
│       │   │   └── index.ts
│       │   ├── styles/          # 스타일 파일
│       │   │   ├── globals.css
│       │   │   ├── components/
│       │   │   └── themes/
│       │   └── config/
│       │       ├── constants.ts
│       │       └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts       # Vite 설정
│       ├── tailwind.config.js   # Tailwind CSS 설정
│       └── dist/
│
├── tools/                       # 개발 도구
│   ├── scripts/                # 빌드/배포 스크립트
│   │   ├── build.sh
│   │   ├── deploy.sh
│   │   ├── test.sh
│   │   └── seed-data.ts
│   ├── docker/                 # Docker 관련
│   │   ├── master-server.Dockerfile
│   │   ├── dedicated-server.Dockerfile
│   │   ├── ai-server.Dockerfile
│   │   └── nginx.conf
│   └── monitoring/             # 모니터링 설정
│       ├── prometheus.yml
│       ├── grafana/
│       └── alerts/
│
├── tests/                      # 테스트
│   ├── unit/                   # 단위 테스트
│   │   ├── shared/
│   │   ├── master-server/
│   │   ├── dedicated-server/
│   │   └── ai-server/
│   ├── integration/            # 통합 테스트
│   │   ├── api/
│   │   ├── socket/
│   │   └── game-flow/
│   ├── e2e/                   # E2E 테스트
│   │   ├── game-scenarios/
│   │   └── load-testing/
│   └── fixtures/              # 테스트 데이터
│       ├── game-states/
│       └── mock-data/
│
└── docs/                      # 문서
    ├── api/                   # API 문서
    │   ├── master-server.md
    │   ├── dedicated-server.md
    │   └── websocket-events.md
    ├── architecture/          # 아키텍처 문서
    │   ├── system-design.md
    │   ├── database-schema.md
    │   └── security.md
    ├── deployment/            # 배포 가이드
    │   ├── docker.md
    │   ├── kubernetes.md
    │   └── monitoring.md
    └── development/           # 개발 가이드
        ├── setup.md
        ├── contributing.md
        └── coding-standards.md
```

## 주요 구성 설명

### 1. 모노레포 구조
- **packages/**: 공통으로 사용되는 패키지들
- **apps/**: 각 마이크로서비스 애플리케이션
- **tools/**: 개발 도구 및 스크립트
- **tests/**: 테스트 코드
- **docs/**: 문서

### 2. TypeScript 설정
```json
// 루트 tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 3. 패키지별 의존성
- **shared**: 공통 타입, 유틸리티, 상수
- **database**: 데이터베이스 모델, 레포지토리
- **logger**: 중앙화된 로깅 시스템

### 4. 빌드 시스템
- **Turbo** (옵션): 모노레포 빌드 최적화
- **각 앱별 독립 빌드**: TypeScript → JavaScript
- **Docker 멀티스테이지 빌드**: 프로덕션 최적화
│

```
# 1. 프로젝트 설정
chmod +x tools/scripts/setup.sh
./tools/scripts/setup.sh

# 2. 개발 시작
npm run dev  # 모든 서비스 동시 실행

# 3. 개별 서비스 실행
npm run start:master     # Master Server
npm run start:dedicated  # Dedicated Server  
npm run start:ai        # AI Server
npm run start:client    # Web Client

# 4. Docker로 실행
npm run docker:up
```