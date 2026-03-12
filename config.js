// 게임 설정 및 상수
export const GAME_CONFIG = {
    // 라운드 설정
    maxRounds: 6,
    roundDurations: [20, 25, 30, 35, 35, 40], // 각 라운드의 지속 시간 (초)
    roundSpeeds: [18, 25, 32, 39, 46, 53], // 각 라운드의 속도
    spawnIntervals: [3.8, 3.4, 3.0, 2.7, 2.4, 2.1], // 각 라운드의 장애물 생성 간격
    
    // 월드 설정
    groundSize: 200,
    groundWidth: 30,
    
    // 플레이어 설정
    sidewaysSpeed: 7, // 너구리 좌우 이동 속도 (초당 단위)
    
    // 장애물 설정
    OBSTACLE_X_RANDOM_OFFSET: 3, // 장애물 X 위치 랜덤 오프셋 최대 범위
    
    // 인트로 애니메이션 설정
    transitionDuration: 1500,
    
    // 카메라 위치
    introInitialCameraPosition: { x: 0, y: 6, z: 5 },
    introSideViewPosition: { x: -15, y: 10, z: 12 },
    introBackViewPosition: { x: 0, y: 10, z: 20 },
    
    // 색상 설정
    skyColor: 0x87ceeb,
    groundColor: 0xF4A460,      // Sandy Brown - 자연스러운 모래색으로 변경
    outerGroundColor: 0xD2B48C,  // Tan - 외부 바닥을 약간 더 어두운 모래색으로 변경
    
    // 텍스처 설정 (향후 확장용)
    useGroundTexture: false,     // true로 설정하면 텍스처 기반 바닥 사용
    
    // 조명 설정
    ambientLightColor: 0xffffff,
    ambientLightIntensity: 0.6,
    directionalLightColor: 0xffffff,
    directionalLightIntensity: 0.8,
    directionalLightPosition: { x: 10, y: 20, z: 5 },
    
    // 카메라 추적 설정
    cameraFollow: {
        followSpeed: 12.0,       // 카메라 추적 속도 (높을수록 빠르게 따라감)
        damping: 0.95,           // 댐핑 계수 (0-1, 높을수록 부드러움)
        maxOffset: 8,            // 최대 카메라 오프셋 (좌우 최대 이동 거리)
        deadZone: 0.1,           // 데드존 (이 값보다 작은 움직임은 무시)
        enabled: true            // 추적 활성화 여부
    }
};

// 계산된 값들
export const CALCULATED_VALUES = {
    get totalGameDuration() {
        return GAME_CONFIG.roundDurations.reduce((sum, duration) => sum + duration, 0);
    },
    
    get mapBoundary() {
        return GAME_CONFIG.groundWidth / 2 - 1;
    },
    
    get roundEndTimes() {
        const times = [];
        let cumulativeTime = 0;
        for (let i = 0; i < GAME_CONFIG.maxRounds; i++) {
            cumulativeTime += GAME_CONFIG.roundDurations[i];
            times.push(cumulativeTime);
        }
        return times;
    }
};