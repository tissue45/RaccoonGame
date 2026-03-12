import { ANIMAL_GESTURES, getAllGestures } from './animal-gesture-config.js';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gestureDisplay = document.getElementById('gesture-display');
const warningOverlay = document.getElementById('warning-overlay');
const warningText = document.getElementById('warning-text');

const CONFIG = {
  FINGER_LANDMARKS: {
    thumb: { tip: 4, pip: 3 },
    index: { tip: 8, mcp: 5 },
    middle: { tip: 12, mcp: 9 },
    ring: { tip: 16, mcp: 13 },
    pinky: { tip: 20, mcp: 17 }
  },
  FACE_TILT: {
    THRESHOLD: 5,
    LEFT_TEXT: '왼쪽으로 기울임',
    RIGHT_TEXT: '오른쪽으로 기울임',
    CENTER_TEXT: '중앙'
  },
  UI_TEXT: {
    PREPARING: '준비 중...',
    READY: '준비 완료!',
    NO_HANDS: '손을 보여주세요!',
  }
};
let handDetector, faceDetector, currentLane = 0;
window.detectedFingers = 0;
window.currentLane = 0; // 전역 변수로 설정 

const fingerJoints = {
    thumb: { tip: 4, pip: 3 },
    index: { tip: 8, mcp: 5 },
    middle: { tip: 12, mcp: 9 },
    ring: { tip: 16, mcp: 13 },
    pinky: { tip: 20, mcp: 17 }
};

function countFingers(hand) {
    const landmarks = hand.keypoints;
    let extendedFingers = 0;
    const thumbTip = landmarks[CONFIG.FINGER_LANDMARKS.thumb.tip];
    const thumbPip = landmarks[CONFIG.FINGER_LANDMARKS.thumb.pip];
    if ((hand.handedness === 'Right' && thumbTip.x < thumbPip.x) || 
        (hand.handedness === 'Left' && thumbTip.x > thumbPip.x)) {
        extendedFingers++;
    }
    for (const finger of ['index', 'middle', 'ring', 'pinky']) {
        const tip = landmarks[CONFIG.FINGER_LANDMARKS[finger].tip];
        const mcp = landmarks[CONFIG.FINGER_LANDMARKS[finger].mcp];
        if (tip.y < mcp.y) {
            extendedFingers++;
        }
    }
    return extendedFingers;
}

function drawFace(face) {
    ctx.beginPath();
    ctx.rect(face.box.xMin, face.box.yMin, face.box.width, face.box.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();

    const leftEye = face.keypoints.find(k => k.name === 'leftEye');
    const rightEye = face.keypoints.find(k => k.name === 'rightEye');
    
    if(leftEye && rightEye) {
        const yDiff = rightEye.y - leftEye.y;
        const xDiff = rightEye.x - leftEye.x;
        const angle = Math.atan2(yDiff, xDiff) * (180 / Math.PI);

        let tiltDirection = CONFIG.FACE_TILT.LEFT_TEXT;
        if (Math.abs(angle) > (180 - CONFIG.FACE_TILT.THRESHOLD)) {
            tiltDirection = CONFIG.FACE_TILT.CENTER_TEXT;
        } else if (angle < 0) {
            tiltDirection = CONFIG.FACE_TILT.RIGHT_TEXT;
        }

        const text = tiltDirection;
        ctx.font = 'bold 18px Arial';
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = 18; 
        const padding = 5;

        const x = face.box.xMin;
        const y = face.box.yMin - textHeight - (padding * 2);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, textWidth + (padding * 2), textHeight + (padding * 2));

        ctx.fillStyle = 'yellow';
        ctx.fillText(text, x + padding, y + textHeight + padding - 2);
    }
}

function drawHands(hands) {
    for (const hand of hands) {
        window.HAND_CONNECTIONS.forEach(pair => {
            const [start, end] = [hand.keypoints[pair[0]], hand.keypoints[pair[1]]];
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();
        });
    }
}

function processHandData(hands) {
    let totalFingers = 0;
    for (const hand of hands) {
        totalFingers += countFingers(hand);
    }
    return { totalFingers };
}

function processFaceForControl(face) {
    const leftEye = face.keypoints.find(k => k.name === 'leftEye');
    const rightEye = face.keypoints.find(k => k.name === 'rightEye');

    if(leftEye && rightEye) {
        const yDiff = rightEye.y - leftEye.y;
        const xDiff = rightEye.x - leftEye.x;
        const angle = Math.atan2(yDiff, xDiff) * (180 / Math.PI);

        if (Math.abs(angle) > (180 - CONFIG.FACE_TILT.THRESHOLD)) {
            currentLane = 0; // 중앙
            window.currentLane = 0;
            
        } else if (angle < 0) {
            currentLane = 1; // 오른쪽
            window.currentLane = 1;
            
        } else {
            currentLane = -1; // 왼쪽
            window.currentLane = -1;
            
            
        }
    }
}

// 랜드마크를 정규화하는 함수 (손목을 기준으로 상대 좌표로 변환)
function normalizeLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) return [];
    
    // 손목 (인덱스 0)을 기준점으로 사용
    const wrist = landmarks[0];
    
    // 손의 크기를 구하기 위해 바운딩 박스 계산
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    landmarks.forEach(lm => {
        minX = Math.min(minX, lm.x);
        maxX = Math.max(maxX, lm.x);
        minY = Math.min(minY, lm.y);
        maxY = Math.max(maxY, lm.y);
    });
    
    const handWidth = maxX - minX;
    const handHeight = maxY - minY;
    const handSize = Math.max(handWidth, handHeight);
    
    // 최소 크기 보장 (너무 작은 손 방지)
    const minSize = 50;
    const normalizedSize = Math.max(handSize, minSize);
    
    // 손목을 기준으로 정규화 (스케일링을 더 관대하게)
    return landmarks.map(lm => ({
        x: (lm.x - wrist.x) / normalizedSize,
        y: (lm.y - wrist.y) / normalizedSize
    }));
}

// 두 제스처 간의 유사도를 계산하는 함수
function calculateGestureSimilarity(landmarks1, landmarks2, animalKey = null) {
    if (!landmarks1 || !landmarks2 || landmarks1.length !== landmarks2.length) {
        return 0;
    }
    
    // 두 제스처 모두 정규화
    const norm1 = normalizeLandmarks(landmarks1);
    const norm2 = normalizeLandmarks(landmarks2);
    
    let totalDistance = 0;
    let validPoints = 0;
    
    // 동물별로 다른 중요 포인트 설정
    let importantPoints, scalingFactor, bonusThreshold;
    
    switch(animalKey) {
        case 'snake':
            // 뱀: 검지손가락 위주로 판단 (검지를 쭉 뻗는 제스처)
            importantPoints = [8, 7, 6, 5]; // 검지 관련 포인트
            scalingFactor = 2; // 매우 관대하게
            bonusThreshold = 0.1;
            break;
        case 'rabbit':
            // 토끼: 검지와 중지 위주로 판단 (브이 제스처)
            importantPoints = [8, 12, 7, 11]; // 검지, 중지 관련 포인트
            scalingFactor = 2.2; // 관대하게
            bonusThreshold = 0.15;
            break;
        case 'tiger':
            // 호랑이: 손가락 끝점들 위주
            importantPoints = [4, 8, 12, 16, 20];
            scalingFactor = 2.8;
            bonusThreshold = 0.2;
            break;
        case 'elephant':
            // 코끼리: 전체적인 손 모양
            importantPoints = [4, 8, 12, 16, 20, 0];
            scalingFactor = 2.5;
            bonusThreshold = 0.18;
            break;
        default:
            importantPoints = [4, 8, 12, 16, 20];
            scalingFactor = 3;
            bonusThreshold = 0.2;
    }
    
    for (let i = 0; i < norm1.length; i++) {
        const dx = norm1[i].x - norm2[i].x;
        const dy = norm1[i].y - norm2[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 중요한 점들은 가중치를 더 주고, 일반 점들은 덜 민감하게
        const weight = importantPoints.includes(i) ? 2.0 : 0.5;
        totalDistance += distance * weight;
        validPoints += weight;
    }
    
    // 평균 거리 계산
    const avgDistance = totalDistance / validPoints;
    
    // 동물별 스케일링 적용
    let similarity = Math.max(0, 1 - avgDistance * scalingFactor);
    
    // 추가 보정
    if (similarity > bonusThreshold) {
        similarity += 0.15; // 보너스 증가
    }
    
    // 뱀과 토끼에게 추가 보너스
    if ((animalKey === 'snake' || animalKey === 'rabbit') && similarity > 0.1) {
        similarity += 0.1;
    }
    
    return Math.min(similarity, 1.0); // 최대값 1.0으로 제한
}

// 현재 손모양과 저장된 동물 제스처들을 비교하는 함수
function recognizeAnimalGesture(currentLandmarks) {
    if (!currentLandmarks || currentLandmarks.length === 0) {
        return null;
    }
    
    const gestures = getAllGestures();
    let bestMatch = null;
    let highestSimilarity = 0;
    
    // 동물별로 다른 임계값 사용 (뱀과 토끼는 더 관대하게)
    const thresholds = {
        tiger: 0.3,
        rabbit: 0.2,  // 토끼는 더 낮은 임계값
        elephant: 0.3,
        snake: 0.15   // 뱀은 가장 낮은 임계값
    };
    
    for (const [animalKey, gestureData] of Object.entries(gestures)) {
        if (gestureData.landmarks && gestureData.landmarks.length > 0) {
            const similarity = calculateGestureSimilarity(currentLandmarks, gestureData.landmarks, animalKey);
            const threshold = thresholds[animalKey] || 0.3;
            
            if (similarity > highestSimilarity && similarity > threshold) {
                highestSimilarity = similarity;
                bestMatch = {
                    animal: animalKey,
                    name: gestureData.name,
                    similarity: similarity
                };
            }
        }
    }
    
    return bestMatch;
}

function updateStatus(hands) {
    if (hands.length > 0) {
        const { totalFingers } = processHandData(hands);
        window.detectedFingers = totalFingers;
        warningOverlay.style.display = 'none';
        
        // 동물 제스처 인식 시도
        const currentLandmarks = hands[0].keypoints.map(kp => ({ x: kp.x, y: kp.y }));
        const recognizedAnimal = recognizeAnimalGesture(currentLandmarks);
        
        if (recognizedAnimal) {
            gestureDisplay.innerText = `${recognizedAnimal.name} 인식됨!`;
            // 즉시 변신 실행 (쿨타임은 내부에서 처리)
            transformToAnimal(recognizedAnimal.animal);
        } else {
            if (currentAnimalForm) {
                gestureDisplay.innerText = `${getAnimalName(currentAnimalForm)} 형태`;
            } else {
                gestureDisplay.innerText = '손 감지됨';
            }
        }
    } else {
        window.detectedFingers = 0;
        warningOverlay.style.display = 'none';
        gestureDisplay.innerText = CONFIG.UI_TEXT.NO_HANDS;
    }
}



// 즉시 변신 시스템
let currentAnimalForm = null;
let transformTimer = null;
let lastTransformTime = 0;
let isTransforming = false;

const ANIMAL_HOLD_TIME = 2000; // 동물 형태 유지 시간 (2초)
const TRANSFORM_COOLDOWN = 1000; // 변신 쿨다운 (1초)

// 즉시 변신 함수
function transformToAnimal(animalKey) {
    const now = Date.now();
    
    // 이미 동물 형태거나 쿨타임 중이라면 무시
    if (currentAnimalForm !== null || isTransforming || (now - lastTransformTime < TRANSFORM_COOLDOWN)) {
        return;
    }
    
    const animalModels = {
        tiger: 'animal/tiger_Walking.glb',
        rabbit: 'animal/rabbit_Walkng.glb',
        elephant: 'animal/elephant_Walking.glb',
        snake: 'animal/snake.glb'
    };
    
    const animalEmojis = {
        tiger: '🐯',
        rabbit: '🐇',
        elephant: '🐘',
        snake: '🐍'
    };
    
    const animalSquares = {
        tiger: 'tiger-square',
        rabbit: 'rabbit-square',
        elephant: 'elephant-square',
        snake: 'snake-square'
    };

    const modelPath = animalModels[animalKey];
    if (!modelPath || typeof window.changePlayerModel !== 'function') {
        console.error(`❌ 변신 실패: 유효하지 않은 동물 키 또는 모델 변경 함수 없음`);
        return;
    }

    try {
        window.changePlayerModel(modelPath);
        currentAnimalForm = animalKey;
        isTransforming = true;

        // 진행바 이모지 업데이트
        const emojiIndicator = document.getElementById('emoji-indicator');
        if (emojiIndicator) {
            emojiIndicator.innerText = animalEmojis[animalKey];
        }

        // UI 스퀘어 업데이트
        document.querySelectorAll('.square').forEach(s => s.classList.remove('selected-square'));
        const selectedSquare = document.getElementById(animalSquares[animalKey]);
        if (selectedSquare) {
            selectedSquare.classList.add('selected-square');
        }

        // 2초 유지 후 너구리 복귀
        transformTimer = setTimeout(() => {
            transformBackToRaccoon();
        }, ANIMAL_HOLD_TIME);
    } catch (error) {
        console.error(`❌ 변신 중 오류:`, error);
    }
    
    function transformBackToRaccoon() {
        if (typeof window.changePlayerModel === 'function') {
            try {
                window.changePlayerModel('animal/raccoon_Walking.glb');
                currentAnimalForm = null;
                lastTransformTime = Date.now();
                isTransforming = false;
                
                // 진행바 이모지를 너구리로 복귀
                const emojiIndicator = document.getElementById('emoji-indicator');
                if (emojiIndicator) {
                    emojiIndicator.innerText = '🦝';
                }

                // UI 스퀘어 선택 해제
                document.querySelectorAll('.square').forEach(s => s.classList.remove('selected-square'));
            } catch (error) {
                console.error(`❌ 너구리로 복귀 중 오류:`, error);
            }
        }
    }
}


// 동물별 한글 이름 반환
function getAnimalName(animalKey) {
    const names = {
        tiger: '호랑이',
        rabbit: '토끼',
        elephant: '코끼리',
        snake: '뱀'
    };
    return names[animalKey] || '너구리';
}



// 너구리로 돌아가기
function transformBackToRaccoon() {
    if (currentAnimalForm === null) {
        return;
    }
    

    
    // 너구리 모델로 변신
    if (typeof window.changePlayerModel === 'function') {
        try {
            window.changePlayerModel('animal/raccoon_Walking.glb');
        } catch (error) {
            console.error('❌ 너구리 복귀 중 오류:', error);
        }
    }
    
    currentAnimalForm = null;
    lastTransformTime = Date.now(); // 쿨타임 시작
    
    // 진행바 이모지를 너구리로 복귀
    const emojiIndicator = document.getElementById('emoji-indicator');
    if (emojiIndicator) {
        emojiIndicator.innerText = '🦝';
    }

    // UI 스퀘어 선택 해제
    document.querySelectorAll('.square').forEach(s => s.classList.remove('selected-square'));

    if (transformTimer) {
        clearTimeout(transformTimer);
        transformTimer = null;
    }
}

async function renderLoop() {
    const [hands, faces] = await Promise.all([
        handDetector.estimateHands(video, { flipHorizontal: true }),
        faceDetector.estimateFaces(video, { flipHorizontal: true })
    ]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (faces.length > 0) {
        processFaceForControl(faces[0]);
    }

    faces.forEach(drawFace);
    updateStatus(hands);

    if (hands.length > 0) {
        window.currentHandLandmarks = hands[0].keypoints; // 첫 번째 손의 랜드마크를 전역 변수에 저장
        drawHands(hands);
    }

    requestAnimationFrame(renderLoop);
}

async function main() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await new Promise((resolve) => { video.onloadedmetadata = () => resolve(video); });
    
    [canvas.width, canvas.height] = [video.videoWidth, video.videoHeight];

    const handModel = handPoseDetection.SupportedModels.MediaPipeHands;
    handDetector = await handPoseDetection.createDetector(handModel, { 
        runtime: 'mediapipe', 
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands', 
        modelType: 'full', 
        maxHands: 2 
    });

    const faceModel = faceDetection.SupportedModels.MediaPipeFaceDetector;
    faceDetector = await faceDetection.createDetector(faceModel, {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
        modelType: 'short'
    });
    
    gestureDisplay.innerText = CONFIG.UI_TEXT.READY;
    renderLoop();
  } catch (error) {
    console.error("오류 발생:", error);
    gestureDisplay.innerText = '카메라를 찾을 수 없습니다.';
  }
}

gestureDisplay.innerText = CONFIG.UI_TEXT.PREPARING;
main();
