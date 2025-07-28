import { scene } from './scene-setup.js';
import { GAME_CONFIG } from './config.js';
import { 
    treeModel, 
    bushModel, 
    bushLargeModel, 
    bushFlowersModel, 
    personModel, 
    holeModel, 
    rockModel 
} from './model-loader.js';

// 장애물 관련 변수들
export let obstacles = [];
export let sceneryObjects = [];
export let sceneryCreated = false;

// 게임 종료 관련
export let endGameSign = null;

// 장애물 메쉬 생성
function createObstacleMesh(type) {
    let obstacle;
    if (type === 'stylized_tree' && treeModel) {
        obstacle = treeModel.clone();
    } else if (type === 'bush' && bushModel) {
        obstacle = bushModel.clone();
    } else if (type === 'person' && personModel) {
        obstacle = personModel.clone();
    } else if (type === 'hole' && holeModel) {
        obstacle = holeModel.clone();
    } else if (type === 'rock' && rockModel) {
        obstacle = rockModel.clone();
    } else {
        return null; // 로드되지 않았거나 타입이 일치하지 않으면 null 반환
    }
    obstacle.castShadow = true;
    
    // 장애물 타입 정보 저장 (동물 능력 시스템에서 사용)
    obstacle.userData.obstacleType = type;
    
    return obstacle;
}

// 장애물 생성
export function spawnObstacle() {
    const availableLanes = [-1, 0, 1];
    const randomValue = Math.random();

    if (randomValue < 0.6) { // 60% 확률로 bush 개별 생성
        const numObstaclesToSpawn = 2; // 항상 2개의 장애물 생성
        const selectedLanes = [];

        while (selectedLanes.length < numObstaclesToSpawn) {
            const randomIndex = Math.floor(Math.random() * availableLanes.length);
            const lane = availableLanes[randomIndex];
            if (!selectedLanes.includes(lane)) {
                selectedLanes.push(lane);
            }
        }

        selectedLanes.forEach(lane => {
            const obstacle = createObstacleMesh('bush');
            if (obstacle) {
                const randomOffsetX = (Math.random() * 2 - 1) * GAME_CONFIG.OBSTACLE_X_RANDOM_OFFSET;
                obstacle.position.set(lane * 10 + randomOffsetX, 0, -150);
                obstacles.push(obstacle);
                scene.add(obstacle);
            }
        });
    } else { // 40% 확률로 stylized_tree, hole, rock, person 중 하나를 일렬 생성
        const obstacleTypes = ['stylized_tree', 'hole', 'rock', 'person'];
        const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

        const fixedXPositions = [-12, -8, -4, 0, 4, 8, 12]; // 가로 일렬 배치를 위한 고정 X 위치
        
        // rock 장애물은 위치를 조정해서 생성 (왼쪽으로 더 이동)
        if (randomObstacleType === 'rock') {
            const adjustedXPositions = [-16, -12, -8, -4, 0, 4, 8]; // 돌 장애물용 조정된 위치 (왼쪽으로 더 이동)
            adjustedXPositions.forEach(xPos => {
                const obstacle = createObstacleMesh(randomObstacleType);
                if (obstacle) {
                    obstacle.position.set(xPos, 0, -150);
                    obstacle.userData.rockId = Math.random().toString(36).substr(2, 9);
                    obstacles.push(obstacle);
                    scene.add(obstacle);
                }
            });
        } else {
            // 다른 장애물들은 기존 위치 사용
            fixedXPositions.forEach(xPos => {
                const obstacle = createObstacleMesh(randomObstacleType);
                if (obstacle) {
                    obstacle.position.set(xPos, 0, -150);
                    
                    // person 장애물의 경우 개별 ID 부여 및 위치 조정 (독립적 움직임을 위해)
                    if (randomObstacleType === 'person') {
                        obstacle.userData.personId = Math.random().toString(36).substr(2, 9);
                        obstacle.position.y = 1.5; // 사람 장애물만 위로 올림
                    }
                    
                    obstacles.push(obstacle);
                    scene.add(obstacle);
                }
            });
        }
    }
}

// 초기 장애물 생성
export function initializeObstacles() {
    const numInitialObstacles = 5; // 장애물 개수 줄임
    const firstObstacleZ = -40; // 첫 번째 장애물을 더 멀리 배치
    const obstacleSpacing = GAME_CONFIG.roundSpeeds[0] * GAME_CONFIG.spawnIntervals[0]; // 첫 번째 라운드의 실제 간격 사용

    for (let i = 0; i < numInitialObstacles; i++) {
        const zPosition = firstObstacleZ - (i * obstacleSpacing);
        const availableLanes = [-1, 0, 1];
        const randomValue = Math.random();

        if (randomValue < 0.6) { // 60% 확률로 bush 개별 생성
            const numObstaclesToSpawn = 2; // 항상 2개의 장애물 생성
            const selectedLanes = [];

            while (selectedLanes.length < numObstaclesToSpawn) {
                const randomIndex = Math.floor(Math.random() * availableLanes.length);
                const lane = availableLanes[randomIndex];
                if (!selectedLanes.includes(lane)) {
                    selectedLanes.push(lane);
                }
            }

            selectedLanes.forEach(lane => {
                const obstacle = createObstacleMesh('bush');
                if (obstacle) {
                    const randomOffsetX = (Math.random() * 2 - 1) * GAME_CONFIG.OBSTACLE_X_RANDOM_OFFSET;
                    obstacle.position.set(lane * 10 + randomOffsetX, 0, zPosition);
                    obstacles.push(obstacle);
                    scene.add(obstacle);
                }
            });
        } else { // 40% 확률로 stylized_tree, hole, rock, person 중 하나를 일렬 생성
            const obstacleTypes = ['stylized_tree', 'hole', 'rock', 'person'];
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

            const fixedXPositions = [-12, -8, -4, 0, 4, 8, 12]; // 가로 일렬 배치를 위한 고정 X 위치
            
            // rock 장애물은 위치를 조정해서 생성 (왼쪽으로 더 이동)
            if (randomObstacleType === 'rock') {
                const adjustedXPositions = [-16, -12, -8, -4, 0, 4, 8]; // 돌 장애물용 조정된 위치 (왼쪽으로 더 이동)
                adjustedXPositions.forEach(xPos => {
                    const obstacle = createObstacleMesh(randomObstacleType);
                    if (obstacle) {
                        obstacle.position.set(xPos, 0, zPosition);
                        obstacle.userData.rockId = Math.random().toString(36).substr(2, 9);
                        obstacles.push(obstacle);
                        scene.add(obstacle);
                    }
                });
            } else {
                // 다른 장애물들은 기존 위치 사용
                fixedXPositions.forEach(xPos => {
                    const obstacle = createObstacleMesh(randomObstacleType);
                    if (obstacle) {
                        obstacle.position.set(xPos, 0, zPosition);
                        
                        // person 장애물의 경우 개별 ID 부여 및 위치 조정 (독립적 움직임을 위해)
                        if (randomObstacleType === 'person') {
                            obstacle.userData.personId = Math.random().toString(36).substr(2, 9);
                            obstacle.position.y = 1.5; // 사람 장애물만 위로 올림
                        }
                        
                        obstacles.push(obstacle);
                        scene.add(obstacle);
                    }
                });
            }
        }
    }
}

// sceneryCreated 상태 변경 함수
export function setSceneryCreated(created) {
    sceneryCreated = created;
}

// 풍경 생성
export function createScenery() {
    if (sceneryCreated) return; // 이미 생성되었으면 리턴
    
    const numBushes = 100; // 덤불 개수

    // 덤불 생성
    for (let i = 0; i < numBushes; i++) {
        let bushToSpawn = null;
        const randomBushType = Math.random();

        if (randomBushType < 0.33 && bushModel) {
            bushToSpawn = bushModel.clone();
        } else if (randomBushType < 0.66 && bushLargeModel) {
            bushToSpawn = bushLargeModel.clone();
        } else if (bushFlowersModel) {
            bushToSpawn = bushFlowersModel.clone();
        }

        if (bushToSpawn) {
            const side = Math.random() < 0.5 ? -1 : 1; // 왼쪽 또는 오른쪽에 배치
            const minDistanceFromCenter = GAME_CONFIG.groundWidth / 2 + 5; // 게임 경로에서 최소 5만큼 떨어진 거리
            bushToSpawn.position.set(
                side * (minDistanceFromCenter + Math.random() * 65), // 게임 경로 밖에만 배치
                1.5, // y 위치
                (Math.random() - 0.5) * GAME_CONFIG.groundSize * 4 // z 위치
            );
            sceneryObjects.push(bushToSpawn);
            scene.add(bushToSpawn);
        }
    }
    sceneryCreated = true; // 풍경 생성 완료 표시
}

// 팻말 생성 (기존 - 게임 시작용)
export function createFinishSign() {
    const signGeometry = new THREE.BoxGeometry(GAME_CONFIG.groundWidth, 4, 1);
    const signMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // 갈색
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.y = 1.5; // 지면 위에 위치
    sign.castShadow = true;
    return sign;
}

// 게임 종료용 보라색 팻말 생성
export function createEndGameSign() {
    if (endGameSign) return endGameSign; // 이미 생성된 경우 기존 것 반환
    
    // 팻말 기둥 생성
    const postGeometry = new THREE.CylinderGeometry(0.3, 0.3, 7); // 기둥을 더 두껍고 길게
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x4B0082 }); // 진한 보라색
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(0, 3.5, 0);
    post.castShadow = true;
    
    // 팻말 판 생성 (메인길 크기에 맞춰)
    const signGeometry = new THREE.BoxGeometry(GAME_CONFIG.groundWidth, 5, 0.7); // 팻말 판을 더 크게
    const signMaterial = new THREE.MeshStandardMaterial({ color: 0x9370DB }); // 중간 보라색
    const signBoard = new THREE.Mesh(signGeometry, signMaterial);
    signBoard.position.set(0, 6, 0);
    signBoard.castShadow = true;
    
    // 텍스트 생성 (Canvas를 이용한 텍스처)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 256;
    
    // 배경 (중간 보라색)
    context.fillStyle = '#9370DB';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 테두리 (진한 보라색)
    context.strokeStyle = '#4B0082';
    context.lineWidth = 10;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    
    // 텍스트 설정 (더 크고 굵게, 흰색으로)
    context.fillStyle = '#FFFFFF';
    context.font = 'bold 64px Arial'; // 폰트 크기 증가
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // 텍스트 그림자 효과 (가독성 향상)
    context.shadowColor = 'rgba(0, 0, 0, 0.7)';
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;
    context.shadowBlur = 5;
    
    // 텍스트 그리기
    context.fillText('동물보호구역', canvas.width / 2, canvas.height / 2);
    
    // 텍스처 생성 및 적용
    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshStandardMaterial({ map: texture, transparent: true });
    const textBoard = new THREE.Mesh(signGeometry, textMaterial);
    textBoard.position.set(0, 6, 0.36); // 팻말 앞면에 배치
    
    // 그룹으로 묶기
    const signGroup = new THREE.Group();
    signGroup.add(post);
    signGroup.add(signBoard);
    signGroup.add(textBoard);
    
    // 초기 위치 설정 (화면 오른쪽 멀리)
    signGroup.position.set(0, 0, -200);
    signGroup.userData.isEndGameSign = true;
    signGroup.userData.speed = GAME_CONFIG.roundSpeeds[0]; // 현재 게임 속도와 동일하게
    
    endGameSign = signGroup;
    scene.add(endGameSign);
    
    return endGameSign;
}

// 게임 종료 팻말 이동 업데이트
export function updateEndGameSign(deltaTime, worldSpeed) {
    if (!endGameSign) return;
    
    // 팻말을 플레이어 쪽으로 이동
    endGameSign.position.z += worldSpeed * deltaTime;
    
    // 팻말이 플레이어를 지나쳤으면 제거 (안전장치)
    if (endGameSign.position.z > 50) {
        scene.remove(endGameSign);
        endGameSign = null;
    }
}

// 게임 종료 팻말과의 충돌 확인 (AABB 방식)
export function checkEndGameSignCollision(player, playerSize = 2) {
    if (!endGameSign) return false;

    // 플레이어의 경계 상자 (Bounding Box) 생성
    const playerBox = new THREE.Box3().setFromObject(player);

    // 팻말의 경계 상자 생성
    const signBox = new THREE.Box3().setFromObject(endGameSign);

    // 두 경계 상자가 교차하는지 확인
    return playerBox.intersectsBox(signBox);
}

// 장애물 제거
export function clearAllObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        scene.remove(obstacles[i]);
    }
    obstacles.length = 0;
}