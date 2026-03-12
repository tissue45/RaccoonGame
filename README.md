# RaccoonGame - 3D Interactive WebGame

모션 인식(손 제스처 + 얼굴 기울기)으로 캐릭터를 조작하는 3D 웹게임입니다.

## 프로젝트 소개

- 너구리 캐릭터를 기본으로 달리며 장애물을 피하고 돌파합니다.
- 손 제스처로 동물로 변신해 상황별 스킬을 사용합니다.
- 얼굴 좌우 기울기로 캐릭터 이동 방향을 제어합니다.
- `start.html`에서 시작 화면/설명을 보고 `index.html`로 진입합니다.

## 주요 기능

- **실시간 인식**
  - TensorFlow.js + MediaPipe 기반 손/얼굴 인식
- **3D 렌더링**
  - Three.js 및 GLTF/GLB 모델 로딩
- **상황별 변신 스킬**
  - 코끼리: 나무 부수기
  - 토끼: 슈퍼 점프
  - 뱀: 바위 처리
  - 호랑이: 사람 장애물 대응

## 실행 방법

정적 파일 기반 프로젝트이므로 간단한 로컬 서버로 실행합니다.

### 1) Python 서버

```bash
python -m http.server 5500
```

브라우저에서 아래 주소를 열어 실행합니다.

```text
http://localhost:5500/start.html
```

### 2) VS Code Live Server

- 프로젝트 폴더를 열고 `start.html`을 Live Server로 실행

## 프로젝트 구조

- `start.html`: 타이틀/설명/로딩/진입 화면
- `index.html`: 본 게임 화면
- `main.js`: 게임 루프 및 핵심 동작 시작점
- `hand-face-recognition.js`: 제스처/얼굴 인식 처리
- `scene-setup.js`, `model-loader.js`: 3D 씬 및 모델 초기화
- `animal/`, `obstacle/`, `background/`, `music/`, `image/`: 에셋 폴더

## GitHub Pages 배포

이 프로젝트는 빌드 단계가 없는 정적 웹 프로젝트라 추가 설치 없이 배포 가능합니다.

1. GitHub 저장소의 **Settings > Pages**로 이동
2. **Build and deployment**에서 `Deploy from a branch` 선택
3. Branch를 `main`, 폴더를 `/ (root)`로 선택 후 저장
4. 배포 완료 후 안내되는 URL로 접속

## 참고

- 카메라 권한이 허용되어야 손/얼굴 인식 기능이 동작합니다.
- 브라우저 자동재생 정책에 따라 오디오는 사용자 상호작용 후 재생될 수 있습니다.
