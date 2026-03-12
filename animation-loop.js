import { scene, camera, renderer, grounds, clouds, emojiIndicator, cameraFollowSystem, zooBackground } from './scene-setup.js';
import { GAME_CONFIG, CALCULATED_VALUES } from './config.js';
import { updateMixer, clock, getPlayer, introRaccoon, setPlayerFromIntroRaccoon } from './model-loader.js';
import { updatePlayerModelBasedOnGesture, updatePlayerMovement } from './player-controller.js';
import {
    spawnObstacle,
    obstacles,
    sceneryObjects,
    sceneryCreated,
    createScenery,
    clearAllObstacles,
    createEndGameSign,
    updateEndGameSign,
    checkEndGameSignCollision
} from './obstacle-manager.js';
import {
    currentRound,
    totalElapsedTime,
    worldSpeed,
    gameStarted,
    gameEnded,
    isPaused,
    animationPhase,
    phaseStartTime,
    finishSign,
    whistlePlayed,
    isEndSequenceActive,
    gameCompleted,
    checkRoundProgression,
    calculateVisualProgress,
    checkGameCompletion,
    completeGame,
    endGame,
    startGame,
    updateTotalElapsedTime,
    resetSpawnTimer,
    setAnimationPhase,
    setPhaseStartTime,
    shouldSpawnObstacle,
    setWhistlePlayed
} from './game-state.js';
import { updateAnimalAbilities } from './animal-action.js';
import { checkCollisions, setGameOverCallback, getIsGameOver } from './collision-system.js';

// 인트로 애니메이션 카메라 위치들
const introInitialCameraPosition = new THREE.Vector3(
    GAME_CONFIG.introInitialCameraPosition.x,
    GAME_CONFIG.introInitialCameraPosition.y,
    GAME_CONFIG.introInitialCameraPosition.z
);
const introSideViewPosition = new THREE.Vector3(
    GAME_CONFIG.introSideViewPosition.x,
    GAME_CONFIG.introSideViewPosition.y,
    GAME_CONFIG.introSideViewPosition.z
);
const introBackViewPosition = new THREE.Vector3(
    GAME_CONFIG.introBackViewPosition.x,
    GAME_CONFIG.introBackViewPosition.y,
    GAME_CONFIG.introBackViewPosition.z
);
const introLookAtTarget = new THREE.Vector3();

// 메인 애니메이션 루프
export function animate() {
    requestAnimationFrame(animate);
    const deltaTime = Math.min(clock.getDelta(), 1 / 30);

    updateMixer(deltaTime);

    // --- 항상 실행되는 배경 요소들 ---
    // 월드 스크롤링 (바닥)
    grounds.forEach(ground => {
        ground.position.z += worldSpeed * deltaTime;
        if (ground.position.z > GAME_CONFIG.groundSize) {
            ground.position.z -= GAME_CONFIG.groundSize * 2;
        }
    });

    // 구름 이동
    clouds.forEach(cloud => {
        cloud.position.z += worldSpeed * 0.5 * deltaTime;
        if (cloud.position.z > 100) {
            cloud.position.z = -200;
            cloud.position.x = (Math.random() - 0.5) * 200;
        }
    });

    // Zoo 배경 이동 (바닥과 같은 속도로 이동하되, 리셋하지 않음)
    if (zooBackground && zooBackground.visible) {
        zooBackground.position.z += worldSpeed * deltaTime;
        // Zoo 배경이 너무 멀리 가면 숨김 (리셋하지 않음)
        if (zooBackground.position.z > 200) {
            zooBackground.visible = false;
        }
    }

    // 풍경 생성 (한 번만)
    if (!sceneryCreated && scene.children.length > 10) { // 모델들이 로드된 후
        createScenery();
    }

    // 풍경 이동
    sceneryObjects.forEach(obj => {
        let currentSpeed = worldSpeed;
        if (obj.userData.isRunningMan) {
            currentSpeed *= -0.1; // 러닝맨은 월드 스피드보다 1.2배 빠르게 움직임
        }
        obj.position.z += currentSpeed * deltaTime;
        // 애니메이션 믹서 업데이트
        if (obj.userData.mixer) {
            // Temporarily disable mixer update for runningManObstacleModel to debug stack overflow
            if (obj.userData.obstacleType === 'runningMan') {
                // console.log('Skipping mixer update for runningMan obstacle.');
            } else {
                obj.userData.mixer.update(deltaTime);
            }
        }
        // 화면 밖으로 나간 풍경은 반대편에서 다시 나타나도록 처리
        if (obj.position.z > GAME_CONFIG.groundSize) {
            obj.position.z -= GAME_CONFIG.groundSize * 2;
        }
    });

    // --- 게임 상태에 따른 로직 분기 ---
    if (!gameStarted) {
        // 인트로 애니메이션 중에는 카메라 추적 비활성화
        if (cameraFollowSystem) {
            cameraFollowSystem.setEnabled(false);
        }

        // 인트로 애니메이션 로직
        if (introRaccoon) {
            if (animationPhase === 0) {
                camera.lookAt(introRaccoon.position);
            } else if (animationPhase === 1) {
                // front -> side 전환
                const elapsed = performance.now() - phaseStartTime;
                const alpha = Math.min(elapsed / GAME_CONFIG.transitionDuration, 1);
                camera.position.lerpVectors(introInitialCameraPosition, introSideViewPosition, alpha);
                introLookAtTarget.lerpVectors(introRaccoon.position, new THREE.Vector3(-5, 0, 12), alpha);
                camera.lookAt(introLookAtTarget);
                if (alpha >= 1) {
                    setAnimationPhase(2);
                    setPhaseStartTime(performance.now());
                }
            } else if (animationPhase === 2) {
                // side -> back 전환
                const elapsed = performance.now() - phaseStartTime;
                const alpha = Math.min(elapsed / GAME_CONFIG.transitionDuration, 1);
                camera.position.lerpVectors(introSideViewPosition, introBackViewPosition, alpha);
                introLookAtTarget.lerpVectors(new THREE.Vector3(-5, 0, 12), new THREE.Vector3(0, 0, 0), alpha);
                camera.lookAt(introLookAtTarget);
                if (alpha >= 1) {
                    setAnimationPhase(3); // 최종 단계로 이동
                    // 인트로 애니메이션 완료, 게임 시작
                    startGame();

                    // 인트로 너구리를 플레이어로 설정
                    setPlayerFromIntroRaccoon();

                    // 팻말 초기화
                    if (window.initializeFinishSign) {
                        window.initializeFinishSign();
                    }
                }
            }
        }
    } else { // 게임 시작 후 로직
        if (gameEnded) return;

        updateTotalElapsedTime(deltaTime);

        // 카메라 추적 시스템 업데이트
        const player = getPlayer();
        if (cameraFollowSystem && player) {
            // 게임 시작 후 카메라 추적 활성화
            cameraFollowSystem.setEnabled(true);
            // 플레이어 위치에 따라 카메라 업데이트
            cameraFollowSystem.update(player.position.x, deltaTime);
        }

        // 팻말 통과 시 게임 종료
        if (finishSign && player && finishSign.position.z > player.position.z + 2) {
            endGame();
            return;
        }

        // 라운드 진행 확인 (게임이 시작된 후에만)
        checkRoundProgression();

        // 이모티콘 인디케이터 위치 업데이트 (균등한 무지개바 진행을 위한 계산)
        const visualProgress = calculateVisualProgress(totalElapsedTime);
        emojiIndicator.style.left = `${visualProgress * 100}%`;

        // 게임 완료 확인 (100% 도달 시 종료 시퀀스 시작)
        checkGameCompletion();

        // 장애물 생성 (무지개 바가 다 차기 전까지만, 종료 시퀀스가 시작되지 않았을 때만)
        if (shouldSpawnObstacle()) {
            spawnObstacle();
            resetSpawnTimer();
        }

        // 게임 종료 시퀀스 처리
        if (isEndSequenceActive) {
            // 게임 종료 팻말 업데이트
            updateEndGameSign(deltaTime, worldSpeed);

            // 플레이어와 게임 종료 팻말 충돌 확인
            if (player && checkEndGameSignCollision(player)) {
                completeGame();
                return;
            }
        }

        // 장애물 이동 및 제거
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            obstacle.position.z += worldSpeed * deltaTime;

            // 화면 밖으로 나간 장애물 제거
            if (obstacle.position.z > 50) {
                scene.remove(obstacle);
                obstacles.splice(i, 1);
            }
        }

        // 플레이어 이동 처리 (얼굴 인식 기반)
        updatePlayerMovement(deltaTime);

        // 동물 특수 능력 업데이트
        updateAnimalAbilities(deltaTime);

        // 충돌 감지 (게임 오버 상태가 아닐 때만)
        if (!getIsGameOver()) {
            checkCollisions();
        }
    }

    // 렌더링 (게임 오버 상태가 아닐 때만 계속 렌더링)
    if (!getIsGameOver()) {
        renderer.render(scene, camera);
    }
}

// 게임 종료 처리
export function handleGameEnd() {
    clearAllObstacles();

    const gameOverImage = document.createElement('img');
    gameOverImage.src = 'animal/game_cover.png';
    gameOverImage.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 100;';
    document.getElementById('game-container').appendChild(gameOverImage);
}