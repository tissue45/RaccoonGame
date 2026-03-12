# RaccoonGame - 3D Interactive WebGame

손 제스처와 얼굴 기울기 인식을 이용해 캐릭터를 조작하는 3D 인터랙티브 웹게임입니다.
키보드/마우스 중심 조작이 아닌, 사용자의 실제 동작을 게임 입력으로 연결하는 것이 핵심입니다.

## 1) 프로젝트 개요

- **장르**: 3D 러닝/회피 액션 게임
- **컨셉**: 기본 캐릭터(너구리)로 달리며 장애물을 피하고, 제스처로 동물 변신 스킬을 발동
- **입력 방식**
  - 얼굴 좌/우 기울기: 이동 방향 제어
  - 손 제스처: 변신 및 상황별 스킬 발동
- **플레이 흐름**
  - `start.html`(타이틀/설명/로딩) -> `index.html`(본 게임)

## 2) 핵심 기능

### 실시간 인식 시스템

- TensorFlow.js + MediaPipe 기반 손/얼굴 인식
- 브라우저에서 별도 네이티브 앱 없이 동작
- 게임 UI에 현재 인식 상태를 즉시 반영

### 3D 렌더링 및 게임 루프

- Three.js 기반 3D 씬 렌더링
- GLTF/GLB 모델 로딩 및 애니메이션 처리
- 충돌 감지, 오브젝트 배치, 진행도(게이지) 갱신을 게임 루프에서 통합 관리

### 변신 스킬 시스템

- 제스처 인식 시 해당 동물로 변신
- 장애물 유형에 맞는 대응 스킬 자동 적용
- 스킬 종료 후 기본 캐릭터로 복귀

## 3) 제스처/스킬 매핑

| 제스처 | 동물 | 효과 |
|---|---|---|
| 기본 상태 | 너구리 | 기본 달리기 |
| 👍 | 코끼리 | 나무 장애물 대응 |
| ✌ | 토끼 | 점프 기반 장애물 대응 |
| ✊ | 뱀 | 바위/지형 장애물 대응 |
| (뒤집힌) 👆 | 호랑이 | 사람 장애물 대응 |

## 4) 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES Modules)
- **3D**: Three.js, GLTFLoader, FBXLoader
- **AI/CV**: TensorFlow.js, MediaPipe, hand-pose-detection, face-detection
- **Asset**: GLB/GLTF 모델, 텍스처 이미지, 배경음악/효과음

## 5) 로컬 실행 방법

정적 파일 프로젝트이므로 빌드 없이 로컬 서버로 실행합니다.

### 방법 A: Python 서버

```bash
python -m http.server 5500
```

브라우저에서:

```text
http://localhost:5500/start.html
```

### 방법 B: VS Code Live Server

1. 프로젝트 폴더 열기
2. `start.html` 우클릭
3. `Open with Live Server` 실행

## 6) 권장 실행 환경

- Chrome 최신 버전 권장(카메라 API/성능 안정성)
- HTTPS 환경 또는 localhost에서 실행 권장
- 카메라 권한 허용 필수

## 7) 프로젝트 구조

```text
RacconGame/
├─ start.html                      # 시작/설명/로딩 화면
├─ index.html                      # 게임 플레이 화면
├─ main.js                         # 게임 시작점, 전체 흐름 제어
├─ hand-face-recognition.js        # 손/얼굴 인식 처리
├─ scene-setup.js                  # Three.js 씬/카메라/조명 구성
├─ model-loader.js                 # 플레이어/배경/오브젝트 모델 로딩
├─ animation-loop.js               # 렌더 루프 및 프레임 단위 업데이트
├─ collision-system.js             # 충돌 판정 및 결과 처리
├─ game-state.js                   # 라운드/진행도/상태 관리
├─ animal-action.js                # 동물별 동작/스킬 로직
├─ obstacle-manager.js             # 장애물 생성 및 관리
├─ background/, obstacle/, animal/ # 3D 에셋
├─ image/, music/                  # 이미지/오디오 에셋
└─ style.css, start.css            # UI 스타일
```

## 8) GitHub Pages 배포

이 저장소는 정적 사이트이므로 별도 빌드 도구 설치 없이 배포 가능합니다.

1. GitHub 저장소 -> `Settings` -> `Pages`
2. `Build and deployment`에서 `Deploy from a branch` 선택
3. Branch: `main`, Folder: `/ (root)` 선택 후 저장
4. 배포 완료 후 생성된 URL 접속

## 9) 트러블슈팅

### 카메라가 켜지지 않을 때

- 브라우저 주소창의 카메라 권한이 `허용`인지 확인
- 사내/학교 네트워크 정책으로 차단되지 않았는지 확인
- 다른 앱(화상회의 등)이 카메라를 점유 중인지 확인

### 음원이 자동 재생되지 않을 때

- 브라우저 정책상 사용자 클릭 전 자동재생이 제한될 수 있음
- 화면 클릭 또는 키 입력 후 재생되는지 확인

### 모델 로딩이 느릴 때

- 네트워크 상태 확인(에셋 용량 영향)
- 브라우저 캐시 비우기 후 재실행
- 개발자 도구 Network 탭에서 실패 요청 확인

## 10) 향후 개선 아이디어

- 난이도 단계/맵 다양화
- 점수, 랭킹, 플레이 기록 저장
- 모바일 제스처 UX 최적화
- 인식 정확도 향상을 위한 제스처 세분화
