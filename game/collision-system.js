// 충돌 감지 시스템
import { getPlayer } from './model-loader.js';
import { obstacles } from './obstacle-manager.js';

// 게임 오버 상태
let isGameOver = false;
let gameOverCallback = null;

// 게임 오버 콜백 설정
export function setGameOverCallback(callback) {
    gameOverCallback = callback;
}

// 게임 오버 상태 확인
export function getIsGameOver() {
    return isGameOver;
}

// 게임 오버 상태 리셋
export function resetGameOver() {
    isGameOver = false;
}

// AABB (Axis-Aligned Bounding Box) 충돌 감지
function checkAABBCollision(obj1, obj2, obj1Size = 2, obj2Size = 2) {
    const pos1 = obj1.position;
    const pos2 = obj2.position;
    
    // 각 객체의 경계 박스 계산
    const box1 = {
        minX: pos1.x - obj1Size / 2,
        maxX: pos1.x + obj1Size / 2,
        minY: pos1.y - obj1Size / 2,
        maxY: pos1.y + obj1Size / 2,
        minZ: pos1.z - obj1Size / 2,
        maxZ: pos1.z + obj1Size / 2
    };
    
    const box2 = {
        minX: pos2.x - obj2Size / 2,
        maxX: pos2.x + obj2Size / 2,
        minY: pos2.y - obj2Size / 2,
        maxY: pos2.y + obj2Size / 2,
        minZ: pos2.z - obj2Size / 2,
        maxZ: pos2.z + obj2Size / 2
    };
    
    // AABB 충돌 검사
    return (box1.minX <= box2.maxX && box1.maxX >= box2.minX) &&
           (box1.minY <= box2.maxY && box1.maxY >= box2.minY) &&
           (box1.minZ <= box2.maxZ && box1.maxZ >= box2.minZ);
}

// 동물 특수 능력 확인
function canAvoidObstacle(player, obstacle) {
    if (!player || !player.userData || !player.userData.modelPath) {
        return false;
    }
    
    const playerType = player.userData.modelPath;
    const obstacleType = obstacle.userData.obstacleType;
    
    // 토끼는 점프 중일 때 hole 장애물을 피할 수 있음
    if (playerType.includes('rabbit') && obstacleType === 'hole') {
        // 토끼가 점프 중인지 확인 (y 위치가 기본값보다 높으면 점프 중)
        return player.position.y > 2; // 기본 y 위치는 1.5이므로 2보다 높으면 점프 중
    }
    
    // 뱀은 독으로 부식된 rock을 피할 수 있음
    if (playerType.includes('snake') && obstacleType === 'rock') {
        return obstacle.userData.corroding || obstacle.scale.x < 0.5; // 부식 중이거나 크기가 작아진 경우
    }
    
    // 코끼리는 박치기로 파괴된 나무를 피할 수 있음
    if (playerType.includes('elephant') && obstacleType === 'stylized_tree') {
        return obstacle.userData.destroying || obstacle.rotation.x < -0.5; // 파괴 중이거나 쓰러진 경우
    }
    
    // 호랑이는 어흥으로 도망간 사람을 피할 수 있음
    if (playerType.includes('tiger') && obstacleType === 'person') {
        return obstacle.userData.isScared; // 도망가고 있는 경우
    }
    
    return false;
}

// 충돌 감지 메인 함수
export function checkCollisions() {
    if (isGameOver) return; // 이미 게임 오버 상태면 체크하지 않음
    
    const player = getPlayer();
    if (!player) return;
    
    // 모든 장애물과 충돌 검사
    for (const obstacle of obstacles) {
        if (!obstacle || !obstacle.parent) continue; // 제거된 장애물은 건너뛰기
        
        // 플레이어와 장애물 사이의 거리 체크 (성능 최적화)
        const distance = player.position.distanceTo(obstacle.position);
        if (distance > 10) continue; // 너무 멀면 건너뛰기
        
        // AABB 충돌 검사
        if (checkAABBCollision(player, obstacle, 3, 3)) {
            // 동물 특수 능력으로 피할 수 있는지 확인
            if (canAvoidObstacle(player, obstacle)) {
                continue; // 피할 수 있으면 충돌 무시
            }
            
            // 충돌 발생!
            console.log(`충돌 감지! 플레이어와 ${obstacle.userData.obstacleType} 장애물이 충돌했습니다.`);
            triggerGameOver();
            return;
        }
    }
}

// 게임 오버 트리거
function triggerGameOver() {
    if (isGameOver) return; // 중복 호출 방지
    
    isGameOver = true;
    console.log("게임 오버!");
    
    // 게임 오버 화면 표시
    showGameOverScreen();
    
    // 게임 오버 콜백 호출 (게임 루프 정지 등)
    if (gameOverCallback) {
        gameOverCallback();
    }
}

// 게임 오버 화면 표시
function showGameOverScreen() {
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) {
        gameOverOverlay.style.display = 'flex';
        // 약간의 지연 후 애니메이션 시작
        setTimeout(() => {
            gameOverOverlay.classList.add('show');
        }, 100);
        
        // 게임 오버 사운드 재생 (선택사항)
        try {
            const gameOverSound = new Audio('music/menu-click-two-tone.mp3');
            gameOverSound.play().catch(e => console.error("Game over sound failed:", e));
        } catch (error) {
            console.error("Game over sound error:", error);
        }
    }
}

// 게임 재시작
export function restartGame() {
    // 게임 오버 상태 리셋
    resetGameOver();
    
    // 게임 오버 화면 숨기기
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) {
        gameOverOverlay.classList.remove('show');
        setTimeout(() => {
            gameOverOverlay.style.display = 'none';
        }, 1000);
    }
    
    // 페이지 새로고침으로 게임 재시작
    window.location.reload();
}

// 게임 오버 화면 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
});