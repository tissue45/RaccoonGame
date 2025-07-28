import { loadPlayerModel, getPlayer } from './model-loader.js';
import { emojiIndicator } from './scene-setup.js';
import { GAME_CONFIG, CALCULATED_VALUES } from './config.js';

// 플레이어 변신 관련 변수들
let lastTransformTime = 0;
const TRANSFORM_COOLDOWN = 1000; // 1초 (밀리초)
let isTransformationLocked = false; // 변신 잠금 플래그

/**
 * 동물 변신을 트리거하는 범용 함수.
 * @param {string} targetModelPath 변신할 모델의 경로
 * @param {string} targetModelType 모델 타입 (e.g., 'tiger')
 * @param {string} targetEmoji UI에 표시할 이모지
 * @param {string} targetSquareId 하이라이트할 UI 요소의 ID
 */
export function triggerTransformation(targetModelPath, targetModelType, targetEmoji, targetSquareId) {
    // 변신이 잠겨있거나 쿨타임 중이면 아무것도 하지 않음
    if (isTransformationLocked || (Date.now() - lastTransformTime < TRANSFORM_COOLDOWN)) {
        return;
    }

    const player = getPlayer();
    if (player && player.userData.modelPath !== targetModelPath) {
        isTransformationLocked = true; // 변신 잠금
        loadPlayerModel(targetModelPath, targetModelType);
        emojiIndicator.innerText = targetEmoji;

        // UI 업데이트
        document.querySelectorAll('.square').forEach(s => s.classList.remove('selected-square'));
        const selectedSquare = document.getElementById(targetSquareId);
        if (selectedSquare) {
            selectedSquare.classList.add('selected-square');
        }

        // 2초 후에 너구리로 돌아오기
        setTimeout(() => {
            const currentPlayer = getPlayer();
            // 현재 플레이어가 방금 변신한 동물이 맞는지 확인 후 너구리로 변경
            if (currentPlayer && currentPlayer.userData.modelPath === targetModelPath) {
                loadPlayerModel('animal/raccoon_Walking.glb', 'raccoon');
                emojiIndicator.innerText = '🦝';
                document.querySelectorAll('.square').forEach(s => s.classList.remove('selected-square'));
            }
            
            isTransformationLocked = false; // 잠금 해제
            lastTransformTime = Date.now(); // 쿨타임 시작
        }, 2000); // 2초 유지
    }
}

// 이 함수는 더 이상 사용되지 않으므로 내용을 비웁니다.
export function updatePlayerModelBasedOnGesture() {
    // 모든 제스처 기반 변신은 animal-action.js에서 처리됩니다.
}


// 플레이어 이동 처리 함수
export function updatePlayerMovement(deltaTime) {
    const player = getPlayer();
    
    // 첫 번째 호출 시에만 디버깅 로그
    if (!updatePlayerMovement.logged) {
        console.log(`updatePlayerMovement 첫 호출 - player: ${!!player}, currentLane: ${window.currentLane}`);
        updatePlayerMovement.logged = true;
    }
    
    if (player && typeof window.currentLane !== 'undefined') {
        const moveDirection = window.currentLane; // currentLane은 hand-face-recognition.js에서 설정됨
        
        // 디버깅용 로그 (나중에 제거)
        if (moveDirection !== 0) {
            
        }
        
        player.position.x += moveDirection * GAME_CONFIG.sidewaysSpeed * deltaTime;
        
        // 맵 경계 내에서만 이동하도록 제한
        const mapBoundary = CALCULATED_VALUES.mapBoundary;
        player.position.x = THREE.MathUtils.clamp(player.position.x, -mapBoundary, mapBoundary);
    }
}