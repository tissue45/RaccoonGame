// 메인 게임 진입점
import { initializeScene, emojiIndicator, scene, loadZooBackground } from './scene-setup.js';
import { GAME_CONFIG, CALCULATED_VALUES } from './config.js';
import { loadIntroRaccoon, loadAllModels, player } from './model-loader.js';
import { 
    initializeObstacles, 
    createFinishSign,
    createEndGameSign,
    obstacles 
} from './obstacle-manager.js';
import { 
    setAnimationPhase, 
    setPhaseStartTime,
    setFinishSign,
    setWhistlePlayed,
    startGame
} from './game-state.js';
import { animate, handleGameEnd } from './animation-loop.js';

// DOM 요소 초기화
emojiIndicator.innerText = '🦝'; // 너구리 이모티콘

// 게임 초기화
async function initializeGame() {
    try {
        // Scene 초기화
        initializeScene();
        
        // Zoo 배경 로드
        loadZooBackground();
        
        // 모든 모델 로드 시작
        loadAllModels();
        
        // 인트로 너구리 로드 및 인트로 애니메이션 시작
        loadIntroRaccoon(() => {
            // 인트로 애니메이션 시작
            setTimeout(() => {
                setAnimationPhase(1);
                setPhaseStartTime(performance.now());
            }, 2000); // 2초 후 애니메이션 시작

            // 휘파람 소리를 2초 더 빨리 재생
            setTimeout(() => {
                const whistleSound = new Audio('music/whistle.mp3');
                whistleSound.play().catch(e => console.error("Whistle play failed:", e));
                setWhistlePlayed(true);
            }, 1200); // 너구리 로드 후 1.2초 뒤에 재생

            // 초기 장애물 생성 (인트로 애니메이션 시작 전에)
            initializeObstacles();
        });

        // 게임 시작 시 팻말 생성 준비
        window.initializeFinishSign = function() {
            // 팻말 생성 및 위치 설정
            const sign = createFinishSign();
            let totalDistance = 0;
            for (let i = 0; i < GAME_CONFIG.maxRounds; i++) {
                totalDistance += GAME_CONFIG.roundSpeeds[i] * GAME_CONFIG.roundDurations[i];
            }
            sign.position.z = -totalDistance;
            scene.add(sign);
            setFinishSign(sign);
        };

        // 애니메이션 루프 시작
        animate();
        
        console.log("게임 초기화 완료!");
        
    } catch (error) {
        console.error("게임 초기화 중 오류:", error);
    }
}

// 게임 시작
initializeGame();

// 전역 함수들 (기존 코드와의 호환성을 위해)
window.endGame = handleGameEnd;
window.createEndGameSign = createEndGameSign;

// 변신 함수를 전역으로 노출
import { changePlayerModel } from './model-loader.js';
window.changePlayerModel = changePlayerModel;

// 충돌 시스템 초기화
import { setGameOverCallback } from './collision-system.js';

// 게임 오버 콜백 설정 (게임 루프 정지)
setGameOverCallback(() => {
    console.log("게임 오버 콜백 실행 - 게임 루프 정지");
    // 추가적인 게임 오버 처리가 필요하면 여기에 추가
});

// 변신 테스트 함수 (디버깅용)
window.testTransform = function(animalKey) {
    const animalModels = {
        tiger: 'animal/tiger_Walking.glb',
        rabbit: 'animal/rabbit_Walkng.glb',  // 파일명 수정
        elephant: 'animal/elephant_Walking.glb',
        snake: 'animal/snake.glb',  // 파일명 수정
        raccoon: 'animal/raccoon_Walking.glb'
    };
    
    const modelPath = animalModels[animalKey];
    if (modelPath && window.changePlayerModel) {
        console.log(`테스트 변신: ${animalKey} → ${modelPath}`);
        window.changePlayerModel(modelPath);
    } else {
        console.error('테스트 변신 실패:', animalKey, modelPath, typeof window.changePlayerModel);
    }
};




// 윈도우 리사이즈 이벤트는 scene-setup.js에서 처리됨