import { GAME_CONFIG, CALCULATED_VALUES } from './config.js';

// 게임 상태 변수들
export let currentRound = 0;
export let totalElapsedTime = 0;
export let worldSpeed = GAME_CONFIG.roundSpeeds[0];
export let spawnInterval = GAME_CONFIG.spawnIntervals[0];
export let timeSinceLastSpawn = 0;
export let gameStarted = false;
export let gameEnded = false;
export let isPaused = false;

// 인트로 애니메이션 관련
export let animationPhase = 0; // 0: Hold front view, 1: front->side, 2: side->back, 3: wait and start game
export let phaseStartTime = 0;

export let finishSign = null;
export let whistlePlayed = false;

// 게임 종료 시퀀스 관련
export let isEndSequenceActive = false;
export let obstacleGenerationStopped = false;
export let gameCompleted = false;

// 변수 수정 함수들
export function setCurrentRound(round) {
    currentRound = round;
}

export function setTotalElapsedTime(time) {
    totalElapsedTime = time;
}

export function setWorldSpeed(speed) {
    worldSpeed = speed;
}

export function setSpawnInterval(interval) {
    spawnInterval = interval;
}

export function setTimeSinceLastSpawn(time) {
    timeSinceLastSpawn = time;
}

export function setGameStarted(started) {
    gameStarted = started;
}

export function setGameEnded(ended) {
    gameEnded = ended;
}

// 게임 속도 업데이트
export function updateGameSpeed() {
    worldSpeed = GAME_CONFIG.roundSpeeds[currentRound];
    spawnInterval = GAME_CONFIG.spawnIntervals[currentRound];
    console.log(`라운드 ${currentRound + 1} 시작! 속도: ${worldSpeed}, 장애물 생성 간격: ${spawnInterval}`);
}

// 라운드 진행 확인
export function checkRoundProgression() {
    if (gameStarted && currentRound < GAME_CONFIG.maxRounds - 1 && totalElapsedTime >= CALCULATED_VALUES.roundEndTimes[currentRound]) {
        console.log(`라운드 변경: ${currentRound} -> ${currentRound + 1}, 시간: ${totalElapsedTime.toFixed(1)}초, 목표: ${CALCULATED_VALUES.roundEndTimes[currentRound]}초`);
        currentRound++;
        updateGameSpeed();
    }
}

// 시각적 진행률 계산 (균등한 무지개바 진행을 위한 계산)
export function calculateVisualProgress(elapsedTime) {
    // 각 라운드에서 균등한 진행을 위해 현재 라운드와 라운드 내 진행률 계산
    let cumulativeTime = 0;
    for (let i = 0; i < GAME_CONFIG.maxRounds; i++) {
        if (elapsedTime <= cumulativeTime + GAME_CONFIG.roundDurations[i]) {
            // 현재 라운드 내에서의 진행률
            const roundProgress = (elapsedTime - cumulativeTime) / GAME_CONFIG.roundDurations[i];
            // 각 라운드는 전체의 1/6씩 차지
            return (i + roundProgress) / GAME_CONFIG.maxRounds;
        }
        cumulativeTime += GAME_CONFIG.roundDurations[i];
    }
    return 1; // 게임 완료
}

// 게임 종료
export function endGame() {
    if (gameEnded) return;
    gameEnded = true;
}

// 게임 시작
export function startGame() {
    gameStarted = true;
    updateGameSpeed();
    
    // 게임 음악 재생
    if (typeof window.playGameMusic === 'function') {
        window.playGameMusic();
    }
}

// 상태 업데이트 함수들
export function updateTotalElapsedTime(deltaTime) {
    timeSinceLastSpawn += deltaTime;
    if (totalElapsedTime < CALCULATED_VALUES.totalGameDuration && gameStarted) {
        totalElapsedTime += deltaTime;
    }
}

export function resetSpawnTimer() {
    timeSinceLastSpawn = 0;
}

export function setAnimationPhase(phase) {
    animationPhase = phase;
}

export function setPhaseStartTime(time) {
    phaseStartTime = time;
}

export function setFinishSign(sign) {
    finishSign = sign;
}

export function setWhistlePlayed(played) {
    whistlePlayed = played;
}

// 장애물 생성 조건 확인
export function shouldSpawnObstacle() {
    const canSpawn = !obstacleGenerationStopped && totalElapsedTime < CALCULATED_VALUES.totalGameDuration && timeSinceLastSpawn > spawnInterval;
    return canSpawn;
}

// 게임 종료 시퀀스 관련 함수들
export function setEndSequenceActive(active) {
    isEndSequenceActive = active;
}

export function setObstacleGenerationStopped(stopped) {
    obstacleGenerationStopped = stopped;
}

export function setGameCompleted(completed) {
    gameCompleted = completed;
}

// 게임 진행률이 100%에 도달했는지 확인
export function checkGameCompletion() {
    const progress = calculateVisualProgress(totalElapsedTime);
    
    // 마지막 라운드(라운드 5, 0-based)에서 라운드 진행률이 80%를 넘고 아직 종료 시퀀스가 시작되지 않았다면
    if (currentRound >= GAME_CONFIG.maxRounds - 1 && !isEndSequenceActive) {
        // 마지막 라운드 내에서의 진행률 계산
        const lastRoundStartTime = CALCULATED_VALUES.roundEndTimes[GAME_CONFIG.maxRounds - 2] || 0;
        const lastRoundDuration = GAME_CONFIG.roundDurations[GAME_CONFIG.maxRounds - 1];
        const lastRoundElapsed = totalElapsedTime - lastRoundStartTime;
        const lastRoundProgress = lastRoundElapsed / lastRoundDuration;
        
        // 마지막 라운드의 95% 지점에서 팻말 생성
        if (lastRoundProgress >= 0.95) {
            triggerEndSequence();
        }
    }
    
    return progress >= 1.0;
}

// 게임 종료 시퀀스 시작
export function triggerEndSequence() {
    if (isEndSequenceActive) return; // 이미 시작된 경우 중복 실행 방지
    
    console.log("🎯 게임 종료 시퀀스 시작!");
    
    // 상태 변경
    isEndSequenceActive = true;
    obstacleGenerationStopped = true;
    
    // 팻말 생성 (obstacle-manager에서 처리)
    if (typeof window.createEndGameSign === 'function') {
        window.createEndGameSign();
    }
}

// 게임 완료 처리
export function completeGame() {
    if (gameCompleted) return; // 이미 완료된 경우 중복 실행 방지
    
    console.log("🎉 게임 완료!");
    
    gameCompleted = true;
    gameEnded = true;
    
    // 휘슬 사운드 즉시 재생 (팻말에 닿자마자)
    try {
        const whistleSound = new Audio('music/whistle.mp3');
        whistleSound.volume = 0.7;
        whistleSound.play().catch(e => console.log("Whistle sound failed:", e));
    } catch (e) {
        console.log("Whistle sound not available");
    }
    
    // 2초 후 엔딩 페이지로 이동
    setTimeout(() => {
        window.location.href = 'ending.html';
    }, 2000);
}