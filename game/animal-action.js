// ===== 동물 특수 능력 시스템 =====

import { getPlayer } from './model-loader.js';
import { triggerTransformation } from './player-controller.js';
import { obstacles } from './obstacle-manager.js';
import { scene } from './scene-setup.js';

// 토끼 점프 관련 변수
let isJumping = false;
let jumpStartTime = 0;
let jumpDuration = 1.5; // 점프 지속 시간 (초) - 1.5초로 조정
let jumpHeight = 6; // 점프 높이
let originalPlayerY = 1.5; // 플레이어의 기본 Y 위치

// 뱀 독 발사 관련 변수
let poisonProjectiles = []; // 독 발사체 배열
let lastPoisonTime = 0; // 마지막 독 발사 시간
const POISON_COOLDOWN = 3000; // 독 발사 쿨타임 (3초)
let corrodingRocks = []; // 부식 중인 돌들

// 코끼리 박치기 관련 변수
let isHeadbutting = false;
let headbuttStartTime = 0;
let headbuttDuration = 1.0; // 박치기 지속 시간 (초)
let lastHeadbuttTime = 0;
const HEADBUTT_COOLDOWN = 2000; // 박치기 쿨타임 (2초)
let destroyingTrees = []; // 파괴 중인 나무들

// 호랑이 어흥 관련 변수
let isRoaring = false;
let roarStartTime = 0;
let roarDuration = 1.5; // 어흥 지속 시간 (초)
let lastRoarTime = 0;
const ROAR_COOLDOWN = 3000; // 어흥 쿨타임 (3초)
let roarEffects = []; // 어흥 이펙트들
let scaredPersons = []; // 도망가는 사람들

// 제스처 관련 변수
const savedGestures = {};
const animals = [
    { name: 'tiger', modelPath: 'animal/tiger_Walking.glb', emoji: '🐯', squareId: 'tiger-square' },
    { name: 'rabbit', modelPath: 'animal/rabbit_Walkng.glb', emoji: '🐇', squareId: 'rabbit-square' },
    { name: 'snake', modelPath: 'animal/snake.glb', emoji: '🐍', squareId: 'snake-square' },
    { name: 'elephant', modelPath: 'animal/elephant_Walking.glb', emoji: '🐘', squareId: 'elephant-square' },
];

// LocalStorage에서 모든 저장된 제스처 불러오기
function loadSavedGestures() {
    for (const animal of animals) {
        const gestureData = localStorage.getItem(`${animal.name}Gesture`);
        if (gestureData) {
            savedGestures[animal.name] = JSON.parse(gestureData);
            console.log(`저장된 ${animal.name} 손 모양을 불러왔습니다.`);
        }
    }
    console.log("모든 저장된 제스처:", savedGestures);
}

// 두 손 모양 랜드마크 비교 함수 (정규화하여 비교)
function compareGestures(liveLandmarks, savedLandmarks) {
    if (!liveLandmarks || !savedLandmarks || liveLandmarks.length !== savedLandmarks.length) {
        // console.log("비교 실패: 랜드마크 데이터가 없거나 길이가 다릅니다.");
        return false;
    }

    // 1. 정규화 (손목(0번)을 기준으로 모든 점을 이동, 손목과 9번 점 사이의 거리를 1로 만듦)
    function normalize(landmarks) {
        const wrist = landmarks[0];
        const middleFingerBase = landmarks[9];
        const scale = Math.sqrt(Math.pow(wrist.x - middleFingerBase.x, 2) + Math.pow(wrist.y - middleFingerBase.y, 2) + Math.pow(wrist.z - middleFingerBase.z, 2));
        
        // scale이 0이거나 유효하지 않은 경우, 모든 랜드마크를 (0,0,0)으로 정규화하여 NaN 방지
        if (scale === 0 || isNaN(scale)) {
            return landmarks.map(lm => ({ x: 0, y: 0, z: 0 }));
        }

        return landmarks.map(lm => ({
            x: (lm.x - wrist.x) / scale,
            y: (lm.y - wrist.y) / scale,
            z: (lm.z - wrist.z) / scale
        }));
    }

    const normalizedLive = normalize(liveLandmarks);
    const normalizedSaved = normalize(savedLandmarks);
    
    // 2. 각 점 사이의 거리 합산
    let totalDistance = 0;
    for (let i = 0; i < normalizedLive.length; i++) {
        const dx = normalizedLive[i].x - normalizedSaved[i].x;
        const dy = normalizedLive[i].y - normalizedSaved[i].y;
        const dz = normalizedLive[i].z - normalizedSaved[i].z;
        totalDistance += Math.sqrt(dx*dx + dy*dy + dz*dz);
    }

    // 3. 평균 거리가 특정 임계값 이하이면 동일한 제스처로 판단
    const averageDistance = totalDistance / normalizedLive.length;
    const threshold = 0.15; // 임계값 (조금 더 너그럽게 조정)   
    return averageDistance < threshold;
}

// 페이지 로드 시 제스처 불러오기
loadSavedGestures();

// ===== 토끼 점프 기능 =====

// hole 장애물 감지
function checkObstacleAhead() {
    const currentPlayer = getPlayer();
    if (!currentPlayer || !currentPlayer.userData.modelPath || !currentPlayer.userData.modelPath.includes('rabbit')) {
        return false; // 토끼가 아니면 점프하지 않음
    }

    const playerX = currentPlayer.position.x;
    const playerZ = currentPlayer.position.z;
    const detectionDistance = 8; // 앞쪽 8 단위까지 장애물 감지 - 더 가깝게 조정

    // 플레이어 앞쪽의 hole 장애물들만 체크
    for (let obstacle of obstacles) {
        const obstacleX = obstacle.position.x;
        const obstacleZ = obstacle.position.z;

        // hole 장애물인지 확인
        if (obstacle.userData.obstacleType !== 'hole') {
            continue; // hole이 아니면 건너뛰기
        }

        // 장애물이 플레이어 앞쪽에 있고, 같은 레인에 있는지 확인
        if (obstacleZ < playerZ && obstacleZ > playerZ - detectionDistance) {
            const xDistance = Math.abs(obstacleX - playerX);
            if (xDistance < 5) { // 같은 레인으로 간주할 거리
                // console.log("토끼가 hole 장애물을 감지했습니다!");
                return true;
            }
        }
    }
    return false;
}

// 점프 시작
function startJump() {
    if (isJumping) return; // 이미 점프 중이면 무시

    isJumping = true;
    jumpStartTime = performance.now();
    // console.log("토끼 점프 시작!");
}

// 점프 애니메이션 업데이트
function updateJump() {
    const currentPlayer = getPlayer();
    if (!isJumping || !currentPlayer) return;

    const currentTime = performance.now();
    const elapsedTime = (currentTime - jumpStartTime) / 1000; // 초 단위로 변환

    if (elapsedTime >= jumpDuration) {
        // 점프 완료
        isJumping = false;
        currentPlayer.position.y = originalPlayerY;
        return;
    }

    // 포물선 점프 애니메이션 (sin 함수 사용)
    const progress = elapsedTime / jumpDuration;
    const jumpY = originalPlayerY + Math.sin(progress * Math.PI) * jumpHeight;
    currentPlayer.position.y = jumpY;
}

// ===== 뱀 독 발사 기능 =====

// rock 장애물 감지
function checkRockAhead() {
    const currentPlayer = getPlayer();
    if (!currentPlayer || !currentPlayer.userData.modelPath || !currentPlayer.userData.modelPath.includes('snake')) {
        return false; // 뱀이 아니면 독 발사하지 않음
    }

    // 쿨타임 체크 (3초)
    const currentTime = Date.now();
    if (currentTime - lastPoisonTime < POISON_COOLDOWN) {
        return false; // 쿨타임 중이면 발사하지 않음
    }

    const playerX = currentPlayer.position.x;
    const playerZ = currentPlayer.position.z;
    const detectionDistance = 60; // 앞쪽 12 단위까지 rock 장애물 감지
    const sideDetectionWidth = 30; // 좌우 10 단위까지 감지 (범위 확장)

    // 플레이어 앞쪽의 rock 장애물들만 체크
    for (let obstacle of obstacles) {
        const obstacleX = obstacle.position.x;
        const obstacleZ = obstacle.position.z;

        // rock 장애물인지 확인
        if (obstacle.userData.obstacleType !== 'rock') {
            continue; // rock이 아니면 건너뛰기
        }

        // 장애물이 플레이어 앞쪽에 있고, 확장된 좌우 범위 내에 있는지 확인
        if (obstacleZ < playerZ && obstacleZ > playerZ - detectionDistance) {
            const xDistance = Math.abs(obstacleX - playerX);
            if (xDistance < sideDetectionWidth) { // 확장된 좌우 감지 범위
                // console.log("뱀이 rock 장애물을 감지했습니다!");
                return obstacle; // 타겟 rock 반환
            }
        }
    }
    return false;
}

// ===== 뱀 독 발사 기능 =====

// rock 장애물 감지 (주변 3개 바위 찾기)
function checkRockAheadForSnake() {
    const currentPlayer = getPlayer();
    if (!currentPlayer || !currentPlayer.userData.modelPath || !currentPlayer.userData.modelPath.includes('snake')) {
        return false; // 뱀이 아니면 독 발사하지 않음
    }

    // 쿨타임 체크 (3초)
    const currentTime = Date.now();
    if (currentTime - lastPoisonTime < POISON_COOLDOWN) {
        return false; // 쿨타임 중이면 발사하지 않음
    }

    const playerX = currentPlayer.position.x;
    const playerZ = currentPlayer.position.z;
    const detectionDistance = 12; // 앞쪽 12 단위까지 rock 장애물 감지
    
    let nearbyRocks = [];

    // 플레이어 앞쪽의 rock 장애물들만 체크
    for (let obstacle of obstacles) {
        const obstacleX = obstacle.position.x;
        const obstacleZ = obstacle.position.z;

        // rock 장애물인지 확인
        if (obstacle.userData.obstacleType !== 'rock') {
            continue; // rock이 아니면 건너뛰기
        }

        // 장애물이 플레이어 앞쪽에 있고, 같은 레인에 있는지 확인
        if (obstacleZ < playerZ && obstacleZ > playerZ - detectionDistance) {
            const xDistance = Math.abs(obstacleX - playerX);
            if (xDistance < 5) { // 같은 레인으로 간주할 거리
                nearbyRocks.push(obstacle);
            }
        }
    }

    // 가까운 순서로 정렬하고 최대 3개까지만 선택
    if (nearbyRocks.length > 0) {
        nearbyRocks.sort((a, b) => {
            const distA = Math.abs(a.position.z - playerZ);
            const distB = Math.abs(b.position.z - playerZ);
            return distA - distB;
        });
        
        // 최대 3개까지만 반환
        return nearbyRocks.slice(0, 3);
    }
    
    return false;
}

// 독 발사
function spitPoison(targetRocks) {
    const currentPlayer = getPlayer();
    if (!currentPlayer) return;

    // 쿨타임 업데이트
    lastPoisonTime = Date.now();

    // 독 스프레이 생성 (여러 개의 작은 독 입자들)
    const poisonGroup = new THREE.Group();

    // 여러 개의 독 입자 생성 (5-8개)
    const numParticles = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numParticles; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 6, 6);
        const particleMaterial = new THREE.MeshStandardMaterial({
            color: 0x8A2BE2, // 보라색
            emissive: 0x4B0082, // 발광 효과
            transparent: true,
            opacity: 0.7 + Math.random() * 0.3
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // 각 입자마다 약간씩 다른 위치와 속도
        particle.position.set(
            (Math.random() - 0.5) * 0.8, // X축 랜덤 분산
            (Math.random() - 0.5) * 0.5, // Y축 랜덤 분산
            (Math.random() - 0.5) * 0.3  // Z축 랜덤 분산
        );

        // 각 입자의 개별 속도 저장
        particle.userData.velocityX = (Math.random() - 0.5) * 2;
        particle.userData.velocityY = (Math.random() - 0.5) * 1;
        particle.userData.velocityZ = -20 - Math.random() * 10; // 기본적으로 앞으로

        poisonGroup.add(particle);
    }

    const poison = poisonGroup;

    // 뱀의 위치에서 시작
    poison.position.copy(currentPlayer.position);
    poison.position.y += 1; // 뱀 머리 높이
    poison.position.z -= 2; // 뱀 앞쪽에서 시작

    // 타겟 정보 저장
    poison.userData.target = targetRocks; // targetRocks는 이제 배열
    poison.userData.speed = 25; // 독의 이동 속도

    poisonProjectiles.push(poison);
    scene.add(poison);

    // console.log("뱀이 독을 발사했습니다!");
}

// 독 발사체 업데이트
function updatePoisonProjectiles(deltaTime) {
    for (let i = poisonProjectiles.length - 1; i >= 0; i--) {
        const poison = poisonProjectiles[i];
        const targets = Array.isArray(poison.userData.target) ? poison.userData.target : [poison.userData.target];

        // 독 스프레이 입자들 개별 이동
        poison.children.forEach(particle => {
            particle.position.x += particle.userData.velocityX * deltaTime;
            particle.position.y += particle.userData.velocityY * deltaTime;
            particle.position.z += particle.userData.velocityZ * deltaTime;

            // 중력 효과 (약간 아래로 떨어짐)
            particle.userData.velocityY -= 5 * deltaTime;

            // 공기 저항 (속도 감소)
            particle.userData.velocityX *= 0.98;
            particle.userData.velocityY *= 0.98;

            // 입자 회전 효과
            particle.rotation.x += 2 * deltaTime;
            particle.rotation.y += 1.5 * deltaTime;
        });

        // 그룹 전체도 앞으로 이동
        poison.position.z -= poison.userData.speed * deltaTime;

        // 타겟과의 충돌 체크
        if (targets.length > 0) {
            let hitDetected = false;

            for (const rock of targets) {
                // rock이 유효한지, 씬에 아직 존재하는지 확인
                if (!rock || !rock.parent) continue;

                const rockBox = new THREE.Box3().setFromObject(rock);
                const expandedBox = rockBox.clone().expandByScalar(2.0);

                for (const particle of poison.children) {
                    const particleWorldPos = new THREE.Vector3();
                    particle.getWorldPosition(particleWorldPos);

                    if (expandedBox.containsPoint(particleWorldPos)) {
                        hitDetected = true;
                        break; 
                    }
                }
                if (hitDetected) break;
            }

            if (hitDetected) {
                // 충돌! 모든 타겟 돌에 대해 부식 시작
                targets.forEach(rock => {
                    if (rock && rock.parent && !rock.userData.corroding) {
                        startRockCorrosion(rock);
                    }
                });

                // 독 제거
                scene.remove(poison);
                poisonProjectiles.splice(i, 1);
            }
        }

        if (poison.position.z < -200) {
            // 화면 밖으로 나가면 제거
            scene.remove(poison);
            poisonProjectiles.splice(i, 1);
        }
    }
}

// 돌 부식 시작
function startRockCorrosion(rock) {
    if (!rock || rock.userData.corroding) return;

    // 부식 정보 저장
    rock.userData.corroding = true;
    rock.userData.corrosionStartTime = performance.now();
    rock.userData.corrosionDuration = 1000; // 1초 동안 부식 (속도 2배)
    rock.userData.originalScale = rock.scale.clone();

    corrodingRocks.push(rock);
    // console.log("돌이 부식되기 시작합니다!");
}

// 돌 부식 애니메이션 업데이트
function updateRockCorrosion() {
    for (let i = corrodingRocks.length - 1; i >= 0; i--) {
        const rock = corrodingRocks[i];
        const currentTime = performance.now();
        const elapsedTime = currentTime - rock.userData.corrosionStartTime;
        const progress = elapsedTime / rock.userData.corrosionDuration;

        if (progress >= 1) {
            // 부식 완료 - 돌 완전 제거
            const obstacleIndex = obstacles.indexOf(rock);
            if (obstacleIndex > -1) {
                obstacles.splice(obstacleIndex, 1);
            }
            scene.remove(rock);
            corrodingRocks.splice(i, 1);
            // console.log("돌이 완전히 부식되어 사라졌습니다!");
        } else {
            // 부식 애니메이션 (크기 축소만)
            const scale = 1 - progress; // 0%까지 축소 (완전히 사라질 때까지)
            rock.scale.copy(rock.userData.originalScale).multiplyScalar(scale);
        }
    }
}

// ===== 코끼리 박치기 기능 =====

// stylized_tree 장애물 감지 (주변 3개 나무 찾기)
function checkTreeAhead() {
    const currentPlayer = getPlayer();
    if (!currentPlayer || !currentPlayer.userData.modelPath || !currentPlayer.userData.modelPath.includes('elephant')) {
        return false; // 코끼리가 아니면 박치기하지 않음
    }

    // 쿨타임 체크 (2초)
    const currentTime = Date.now();
    if (currentTime - lastHeadbuttTime < HEADBUTT_COOLDOWN) {
        return false; // 쿨타임 중이면 박치기하지 않음
    }

    const playerX = currentPlayer.position.x;
    const playerZ = currentPlayer.position.z;
    const detectionDistance = 10; // 앞쪽 10 단위까지 나무 장애물 감지
    const sideDistance = 8; // 좌우 8 단위까지 나무 감지

    let nearbyTrees = [];

    // 플레이어 주변의 stylized_tree 장애물들 찾기
    for (let obstacle of obstacles) {
        const obstacleX = obstacle.position.x;
        const obstacleZ = obstacle.position.z;

        // stylized_tree 장애물인지 확인
        if (obstacle.userData.obstacleType !== 'stylized_tree') {
            continue; // stylized_tree가 아니면 건너뛰기
        }

        // 장애물이 플레이어 앞쪽에 있는지 확인
        if (obstacleZ < playerZ && obstacleZ > playerZ - detectionDistance) {
            const xDistance = Math.abs(obstacleX - playerX);
            // 좌우 범위 내에 있는 나무들 모두 수집
            if (xDistance <= sideDistance) {
                nearbyTrees.push(obstacle);
            }
        }
    }

    // 가까운 순서로 정렬하고 최대 3개까지만 선택
    if (nearbyTrees.length > 0) {
        nearbyTrees.sort((a, b) => {
            const distA = Math.abs(a.position.x - playerX) + Math.abs(a.position.z - playerZ);
            const distB = Math.abs(b.position.x - playerX) + Math.abs(b.position.z - playerZ);
            return distA - distB;
        });
        
        // 최대 3개까지만 반환
        return nearbyTrees.slice(0, 3);
    }
    
    return false;
}

// 박치기 시작 (여러 나무 동시 파괴)
function startHeadbutt(targetTrees) {
    if (isHeadbutting) return; // 이미 박치기 중이면 무시

    isHeadbutting = true;
    headbuttStartTime = performance.now();
    lastHeadbuttTime = Date.now();

    // 코끼리 attack 애니메이션 재생
    playElephantAttackAnimation();

    // 배열로 받은 나무들을 모두 파괴 시작
    if (Array.isArray(targetTrees)) {
        targetTrees.forEach(tree => {
            startTreeDestruction(tree);
        });
    } else if (targetTrees) {
        // 단일 나무인 경우 (하위 호환성)
        startTreeDestruction(targetTrees);
    }
}

// 박치기 애니메이션 업데이트
function updateHeadbutt() {
    const currentPlayer = getPlayer();
    if (!isHeadbutting || !currentPlayer) return;

    const currentTime = performance.now();
    const elapsedTime = (currentTime - headbuttStartTime) / 1000; // 초 단위로 변환

    if (elapsedTime >= headbuttDuration) {
        // 박치기 완료
        isHeadbutting = false;
        return;
    }

    // 박치기 애니메이션 (앞뒤로 흔들기)
    const progress = elapsedTime / headbuttDuration;
    const shakeIntensity = Math.sin(progress * Math.PI * 8) * 0.3; // 빠른 진동
    currentPlayer.position.z = 12 + shakeIntensity; // 기본 위치에서 앞뒤로 흔들기
}

// 나무 파괴 시작
function startTreeDestruction(tree) {
    if (!tree) return;

    // 파괴 정보 저장
    tree.userData.destroying = true;
    tree.userData.destructionStartTime = performance.now();
    tree.userData.destructionDuration = 1000; // 1초 동안 파괴
    tree.userData.originalScale = tree.scale.clone();
    tree.userData.originalPosition = tree.position.clone();

    // 원본 material 정보 저장 (투명도 문제 방지)
    tree.userData.originalMaterials = new Map();
    tree.traverse(child => {
        if (child.isMesh && child.material) {
            tree.userData.originalMaterials.set(child, {
                transparent: child.material.transparent,
                opacity: child.material.opacity
            });
        }
    });

    destroyingTrees.push(tree);
}

// 나무 파괴 애니메이션 업데이트
function updateTreeDestruction() {
    for (let i = destroyingTrees.length - 1; i >= 0; i--) {
        const tree = destroyingTrees[i];
        const currentTime = performance.now();
        const elapsedTime = currentTime - tree.userData.destructionStartTime;
        const progress = elapsedTime / tree.userData.destructionDuration;

        if (progress >= 1) {
            // 파괴 완료 - 나무 완전 제거
            const obstacleIndex = obstacles.indexOf(tree);
            if (obstacleIndex > -1) {
                obstacles.splice(obstacleIndex, 1);
            }
            scene.remove(tree);
            destroyingTrees.splice(i, 1);
        } else {
            // 나무 쓰러지는 애니메이션 (회전으로 쓰러뜨리기)
            const fallProgress = Math.min(progress * 2, 1); // 처음 50% 시간 동안 쓰러짐

            // 나무가 뒤로 쓰러지는 회전 애니메이션 (플레이어 반대 방향)
            tree.rotation.x = -fallProgress * Math.PI / 2; // -90도까지 회전 (뒤로 쓰러짐)

            // 쓰러지면서 약간 아래로 이동 (뿌리 부분이 고정된 것처럼)
            const fallOffset = fallProgress * 3; // 쓰러지면서 아래로 이동
            tree.position.y = tree.userData.originalPosition.y - fallOffset;

            // 쓰러진 후 크기 축소 (후반 50% 시간 동안)
            if (progress > 0.5) {
                const shrinkProgress = (progress - 0.5) * 2; // 0~1로 정규화
                const scale = 1 - shrinkProgress * 0.3; // 70%까지만 축소 (너무 작아지지 않게)
                tree.scale.copy(tree.userData.originalScale).multiplyScalar(scale);
            }

            // 투명도는 건드리지 않음 (투명해지는 문제 방지)
        }
    }
}

// ===== 호랑이 어흥 기능 =====

// person 장애물 감지
function checkPersonAhead() {
    const currentPlayer = getPlayer();
    if (!currentPlayer || !currentPlayer.userData.modelPath || !currentPlayer.userData.modelPath.includes('tiger')) {
        return false; // 호랑이가 아니면 어흥하지 않음
    }

    // 쿨타임 체크 (3초)
    const currentTime = Date.now();
    if (currentTime - lastRoarTime < ROAR_COOLDOWN) {
        return false; // 쿨타임 중이면 어흥하지 않음
    }

    const playerX = currentPlayer.position.x;
    const playerZ = currentPlayer.position.z;
    const detectionDistance = 15; // 앞쪽 15 단위까지 사람 장애물 감지

    // 플레이어 앞쪽의 person 장애물들만 체크
    for (let obstacle of obstacles) {
        const obstacleZ = obstacle.position.z;

        // person 장애물인지 확인
        if (obstacle.userData.obstacleType !== 'person') {
            continue; // person이 아니면 건너뛰기
        }

        // 장애물이 플레이어 앞쪽에 있는지 확인 (레인 상관없이)
        if (obstacleZ < playerZ && obstacleZ > playerZ - detectionDistance) {
            // console.log("호랑이가 사람 장애물을 감지했습니다!");
            return true;
        }
    }
    return false;
}

// 어흥 시작
function startRoar() {
    if (isRoaring) return; // 이미 어흥 중이면 무시

    isRoaring = true;
    roarStartTime = performance.now();
    lastRoarTime = Date.now();

    // 어흥 이펙트 생성
    createRoarEffect();

    // 사람 장애물들을 양옆으로 피하게 하기
    scareAwayPersonObstacles();
}

// 번개 이펙트 생성
function createRoarEffect() {
    const currentPlayer = getPlayer();
    if (!currentPlayer) return;

    // 번개 모양 생성 (여러 개의 선분으로 구성)
    const lightningGroup = new THREE.Group();

    // 메인 번개 줄기 생성
    const mainLightningPoints = [];
    const startY = currentPlayer.position.y + 3;
    const endY = currentPlayer.position.y - 2;
    const startZ = currentPlayer.position.z - 5;
    const endZ = currentPlayer.position.z - 15;

    // 지그재그 번개 경로 생성
    const segments = 8;
    for (let i = 0; i <= segments; i++) {
        const progress = i / segments;
        const y = startY + (endY - startY) * progress;
        const z = startZ + (endZ - startZ) * progress;
        const x = currentPlayer.position.x + (Math.random() - 0.5) * 4 * Math.sin(progress * Math.PI * 3);
        mainLightningPoints.push(new THREE.Vector3(x, y, z));
    }

    // 메인 번개 선 생성
    const mainGeometry = new THREE.BufferGeometry().setFromPoints(mainLightningPoints);
    const mainMaterial = new THREE.LineBasicMaterial({
        color: 0x00FFFF, // 청록색 번개
        linewidth: 5,
        transparent: true,
        opacity: 1.0
    });
    const mainLightning = new THREE.Line(mainGeometry, mainMaterial);
    lightningGroup.add(mainLightning);

    // 가지 번개들 생성 (3-5개)
    const numBranches = 3 + Math.floor(Math.random() * 3);
    for (let b = 0; b < numBranches; b++) {
        const branchPoints = [];
        const branchStart = mainLightningPoints[2 + Math.floor(Math.random() * 4)]; // 메인 번개 중간에서 시작
        branchPoints.push(branchStart.clone());

        // 가지 번개 경로 생성
        const branchSegments = 3 + Math.floor(Math.random() * 3);
        for (let i = 1; i <= branchSegments; i++) {
            const lastPoint = branchPoints[branchPoints.length - 1];
            const newPoint = new THREE.Vector3(
                lastPoint.x + (Math.random() - 0.5) * 3,
                lastPoint.y - Math.random() * 2,
                lastPoint.z - Math.random() * 3
            );
            branchPoints.push(newPoint);
        }

        const branchGeometry = new THREE.BufferGeometry().setFromPoints(branchPoints);
        const branchMaterial = new THREE.LineBasicMaterial({
            color: 0x87CEEB, // 하늘색 가지 번개
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });
        const branchLightning = new THREE.Line(branchGeometry, branchMaterial);
        lightningGroup.add(branchLightning);
    }

    // 번개 주변 글로우 이펙트 (구체)
    const glowGeometry = new THREE.SphereGeometry(1, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.3
    });
    const glowEffect = new THREE.Mesh(glowGeometry, glowMaterial);
    glowEffect.position.copy(currentPlayer.position);
    glowEffect.position.y += 1;
    glowEffect.position.z -= 3;
    lightningGroup.add(glowEffect);

    // 번개 그룹 위치 설정
    lightningGroup.position.set(0, 0, 0);

    // 이펙트 정보 저장
    lightningGroup.userData.startTime = performance.now();
    lightningGroup.userData.duration = 800; // 0.8초 동안 지속 (번개는 짧게)
    lightningGroup.userData.originalScale = lightningGroup.scale.clone();
    lightningGroup.userData.isLightning = true;

    roarEffects.push(lightningGroup);
    scene.add(lightningGroup);

    // console.log("⚡ 번개 어흥 이펙트 생성!");
}

// 어흥 애니메이션 업데이트
function updateRoar() {
    const currentPlayer = getPlayer();
    if (!isRoaring || !currentPlayer) return;

    const currentTime = performance.now();
    const elapsedTime = (currentTime - roarStartTime) / 1000; // 초 단위로 변환

    if (elapsedTime >= roarDuration) {
        // 어흥 완료
        isRoaring = false;
        return;
    }

    // 어흥 애니메이션 (몸 흔들기)
    const progress = elapsedTime / roarDuration;
    const shakeIntensity = Math.sin(progress * Math.PI * 6) * 0.2; // 진동
    currentPlayer.rotation.y = Math.PI + shakeIntensity; // 기본 회전에서 좌우로 흔들기
}

// 사람 장애물들을 양옆으로 피하게 하기
function scareAwayPersonObstacles() {
    const currentPlayer = getPlayer();
    if (!currentPlayer) return;

    const playerX = currentPlayer.position.x;
    const playerZ = currentPlayer.position.z;
    const scareDistance = 20; // 호랑이 앞쪽 20 단위까지 사람들이 도망

    // 호랑이 앞쪽의 모든 person 장애물들을 찾아서 도망시키기
    for (let obstacle of obstacles) {
        // person 장애물인지 확인
        if (obstacle.userData.obstacleType !== 'person') {
            continue;
        }

        const obstacleZ = obstacle.position.z;
        
        // 호랑이 앞쪽에 있는 사람들만 도망시키기
        if (obstacleZ < playerZ && obstacleZ > playerZ - scareDistance) {
            // 이미 도망가고 있는 사람인지 확인
            if (obstacle.userData.isScared) {
                continue;
            }

            // 도망 정보 설정
            obstacle.userData.isScared = true;
            obstacle.userData.scareStartTime = performance.now();
            obstacle.userData.scareDuration = 500; // 3초 동안 도망
            obstacle.userData.originalPosition = obstacle.position.clone();
            
            // 호랑이를 중심으로 양옆으로 도망가는 방향 결정
            const obstacleX = obstacle.position.x;
            const directionFromTiger = obstacleX - playerX;
            
            // 방향이 0에 가까우면 랜덤하게 좌우 결정
            let escapeDirection;
            if (Math.abs(directionFromTiger) < 2) {
                escapeDirection = Math.random() < 0.5 ? -1 : 1;
            } else {
                escapeDirection = directionFromTiger > 0 ? 1 : -1;
            }
            
            // 도망 속도와 거리 설정 (더 빠르게)
            obstacle.userData.escapeDirection = escapeDirection;
            obstacle.userData.escapeSpeed = 15 + Math.random() * 8; // 15-23 속도로 빠르게 도망
            obstacle.userData.maxEscapeDistance = 40 + Math.random() * 30; // 40-70 거리까지 도망
            
            scaredPersons.push(obstacle);
        }
    }
}

// 도망가는 사람들 애니메이션 업데이트
function updateScaredPersons(deltaTime) {
    for (let i = scaredPersons.length - 1; i >= 0; i--) {
        const person = scaredPersons[i];
        const currentTime = performance.now();
        const elapsedTime = currentTime - person.userData.scareStartTime;
        const progress = elapsedTime / person.userData.scareDuration;

        if (progress >= 1) {
            // 도망 완료 - 장애물에서 제거
            const obstacleIndex = obstacles.indexOf(person);
            if (obstacleIndex > -1) {
                obstacles.splice(obstacleIndex, 1);
            }
            scene.remove(person);
            scaredPersons.splice(i, 1);
        } else {
            // 도망 애니메이션 (양옆으로 빠르게 이동)
            const escapeDistance = person.userData.escapeSpeed * deltaTime;
            person.position.x += person.userData.escapeDirection * escapeDistance;
            
            // 도망가면서 약간 뒤로도 이동 (호랑이에게서 멀어지기)
            person.position.z += escapeDistance * 0.3;
            
            // 도망가면서 회전 (패닉 상태 표현)
            person.rotation.y += 5 * deltaTime;
            
            // 도망가면서 크기 약간 축소 (멀어지는 효과)
            const shrinkFactor = 1 - progress * 0.2; // 최대 20% 축소
            person.scale.multiplyScalar(shrinkFactor / person.userData.lastShrinkFactor || 1);
            person.userData.lastShrinkFactor = shrinkFactor;
        }
    }
}

// 어흥 이펙트 업데이트
function updateRoarEffects() {
    for (let i = roarEffects.length - 1; i >= 0; i--) {
        const effect = roarEffects[i];
        const currentTime = performance.now();
        const elapsedTime = currentTime - effect.userData.startTime;
        const progress = elapsedTime / effect.userData.duration;

        if (progress >= 1) {
            // 이펙트 완료 - 제거
            scene.remove(effect);
            roarEffects.splice(i, 1);
            console.log("어흥 이펙트가 사라졌습니다!");
        } else {
            // 이펙트 애니메이션 (크기 확대 + 투명도 감소)
            const scale = 1 + progress * 2; // 3배까지 확대
            effect.scale.copy(effect.userData.originalScale).multiplyScalar(scale);

            // 투명도 감소 (각 material에 대해 개별 처리)
            effect.traverse(child => {
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            mat.transparent = true;
                            mat.opacity = 0.8 * (1 - progress);
                        });
                    } else {
                        child.material.transparent = true;
                        child.material.opacity = 0.8 * (1 - progress);
                    }
                }
            });

            // 회전 효과
            effect.rotation.z += 0.05; // 천천히 회전
        }
    }
}

// ===== 메인 업데이트 함수 =====

// 토끼 점프 로직 처리
function handleRabbitJump() {
    const currentPlayer = getPlayer();
    if (currentPlayer && currentPlayer.userData.modelPath && currentPlayer.userData.modelPath.includes('rabbit')) {
        // 점프 애니메이션 업데이트
        updateJump();

        // 앞에 장애물이 있고 점프 중이 아니면 점프 시작
        if (!isJumping && checkObstacleAhead()) {
            startJump();
        }
    }
}

// 뱀 독 발사 로직 처리
function handleSnakePoison(deltaTime) {
    const currentPlayer = getPlayer();
    if (currentPlayer && currentPlayer.userData.modelPath && currentPlayer.userData.modelPath.includes('snake')) {
        // 앞에 rock 장애물이 있고 쿨타임이 끝났으면 독 발사
        const targetRocks = checkRockAheadForSnake();
        if(targetRocks && targetRocks.length > 0) {
            spitPoison(targetRocks);
        }
    }

    // 독 발사체 업데이트
    updatePoisonProjectiles(deltaTime);

    // 돌 부식 애니메이션 업데이트
    updateRockCorrosion();
}

// 코끼리 박치기 로직 처리
function handleElephantHeadbutt() {
    const currentPlayer = getPlayer();
    if (currentPlayer && currentPlayer.userData.modelPath && currentPlayer.userData.modelPath.includes('elephant')) {
        // 박치기 애니메이션 업데이트
        updateHeadbutt();

        // 앞에 나무 장애물이 있고 박치기 중이 아니며 쿨타임이 끝났으면 박치기 시작
        if (!isHeadbutting) {
            const targetTree = checkTreeAhead();
            if (targetTree) {
                startHeadbutt(targetTree);
            }
        }
    }

    // 나무 파괴 애니메이션 업데이트
    updateTreeDestruction();
}

// 호랑이 어흥 로직 처리
function handleTigerRoar(deltaTime) {
    const currentPlayer = getPlayer();
    if (currentPlayer && currentPlayer.userData.modelPath && currentPlayer.userData.modelPath.includes('tiger')) {
        // 어흥 애니메이션 업데이트
        updateRoar();

        // 앞에 사람 장애물이 있고 어흥 중이 아니며 쿨타임이 끝났으면 어흥 시작
        if (!isRoaring && checkPersonAhead()) {
            startRoar();
        }
    }

    // 어흥 이펙트 업데이트
    updateRoarEffects();
    
    // 도망가는 사람들 애니메이션 업데이트
    updateScaredPersons(deltaTime);
}

// 모든 동물 특수 능력 업데이트 (animation-loop.js에서 호출)
export function updateAnimalAbilities(deltaTime) {
    // 저장된 제스처 확인 및 변신
    if (window.currentHandLandmarks) {
        // console.log("현재 손 랜드마크 감지됨.");
        for (const animal of animals) {
            if (savedGestures[animal.name]) {
                // console.log(`${animal.name} 제스처와 비교 중...`);
                if (compareGestures(window.currentHandLandmarks, savedGestures[animal.name])) {
                    const player = getPlayer();
                    if (player && (!player.userData.modelPath || !player.userData.modelPath.includes(animal.name))) {
                        console.log(`${animal.name} 손 모양 감지! ${animal.name}(으)로 변신합니다.`);
                        triggerTransformation(animal.modelPath, animal.name, animal.emoji, animal.squareId);
                        // 일치하는 동물을 찾으면 루프 중단
                        break;
                    }
                }
            } else {
                // console.log(`${animal.name} 저장된 제스처 없음.`);
            }
        }
    } else {
        // console.log("현재 손 랜드마크 감지되지 않음.");
    }

    handleRabbitJump();
    handleSnakePoison(deltaTime);
    handleElephantHeadbutt();
    handleTigerRoar(deltaTime);
}

// 코끼리 attack 애니메이션 재생 함수
function playElephantAttackAnimation() {
    const currentPlayer = getPlayer();
    if (!currentPlayer || !currentPlayer.userData.modelPath || !currentPlayer.userData.modelPath.includes('elephant')) {
        return;
    }

    // 현재 플레이어의 mixer 가져오기
    import('./model-loader.js').then(module => {
        const { mixer } = module;
        if (!mixer) {
            console.log('❌ mixer를 찾을 수 없습니다.');
            return;
        }

        console.log('✅ mixer 발견, attack 애니메이션 준비 중...');

        // 현재 재생 중인 모든 액션 정지
        mixer.stopAllAction();

        // attack 애니메이션 찾기 및 재생
        const gltf = currentPlayer.userData.gltf;
        if (gltf && gltf.animations) {
            console.log('🐘 코끼리 attack 애니메이션 찾는 중...');

            // attack 관련 애니메이션 이름들
            const attackAnimationNames = [
                'TRS|attack', 'TRS | attack', 'attack', 'Attack',
                'TRS|headbutt', 'TRS | headbutt', 'headbutt', 'Headbutt',
                'TRS|charge', 'TRS | charge', 'charge', 'Charge'
            ];

            let attackClip = null;
            for (const name of attackAnimationNames) {
                attackClip = THREE.AnimationClip.findByName(gltf.animations, name);
                if (attackClip) {
                    console.log(`🎯 코끼리 attack 애니메이션 발견: "${attackClip.name}"`);
                    break;
                }
            }

            if (attackClip) {
                const attackAction = mixer.clipAction(attackClip);
                attackAction.reset();
                attackAction.setLoop(THREE.LoopOnce); // 한 번만 재생
                attackAction.clampWhenFinished = true; // 마지막 프레임에서 정지
                attackAction.timeScale = 2.0; // 애니메이션 속도 2배 빠르게
                attackAction.play();

                console.log(`🐘 코끼리 attack 애니메이션 재생: "${attackClip.name}"`);

                // attack 애니메이션이 끝나면 다시 기본 애니메이션으로 복귀
                setTimeout(() => {
                    // 기본 walk/run 애니메이션으로 복귀
                    const walkAnimationNames = [
                        'TRS|run', 'TRS | run', 'run', 'Run',
                        'TRS|walk', 'TRS | walk', 'walk', 'Walk', 'Walking'
                    ];

                    let walkClip = null;
                    for (const name of walkAnimationNames) {
                        walkClip = THREE.AnimationClip.findByName(gltf.animations, name);
                        if (walkClip) break;
                    }

                    if (walkClip) {
                        const walkAction = mixer.clipAction(walkClip);
                        walkAction.reset();
                        walkAction.setLoop(THREE.LoopRepeat); // 반복 재생
                        walkAction.play();
                        console.log(`🐘 코끼리 기본 애니메이션으로 복귀: "${walkClip.name}"`);
                    }
                }, (attackClip.duration / 2.0) * 1000); // 애니메이션 속도가 2배 빠르므로 대기 시간도 절반

            } else {
                console.log('❌ 코끼리 attack 애니메이션을 찾을 수 없습니다.');
            }
        }
    }).catch(error => {
        console.error('model-loader.js 모듈 로드 실패:', error);
    });
}