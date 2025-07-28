/**
 * 카메라 추적 시스템
 * 플레이어의 좌우 움직임을 부드럽게 따라가는 카메라 시스템
 */
export class CameraFollowSystem {
    constructor(camera, config) {
        this.camera = camera;
        this.config = config;
        
        // 카메라 추적 상태
        this.targetX = 0;           // 목표 X 위치
        this.currentX = 0;          // 현재 X 위치
        this.velocity = 0;          // 현재 속도
        this.enabled = true;        // 추적 활성화 여부
        
        // 기본 카메라 위치 저장
        this.basePosition = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        };
        
        // 이전 플레이어 위치 (급격한 변화 감지용)
        this.previousPlayerX = 0;
    }
    
    /**
     * 카메라 추적 업데이트 (매 프레임 호출)
     * @param {number} playerX - 플레이어의 X 위치
     * @param {number} deltaTime - 프레임 시간 간격
     */
    update(playerX, deltaTime) {
        if (!this.enabled || playerX === null || playerX === undefined) {
            // 추적이 비활성화되었거나 플레이어가 없으면 기본 위치로 복귀
            this.returnToBasePosition(deltaTime);
            return;
        }
        
        // 급격한 위치 변화 감지 (텔레포트 등)
        const positionDelta = Math.abs(playerX - this.previousPlayerX);
        if (positionDelta > this.config.maxOffset * 2) {
            // 급격한 변화 시 즉시 카메라 위치 조정
            this.currentX = this.calculateTargetX(playerX);
            this.velocity = 0;
        } else {
            // 일반적인 스무딩 업데이트
            this.smoothUpdate(playerX, deltaTime);
        }
        
        // 카메라 위치 적용
        this.camera.position.x = this.basePosition.x + this.currentX;
        this.previousPlayerX = playerX;
    }
    
    /**
     * 즉시 카메라 업데이트 (플레이어와 동시 이동)
     * @param {number} playerX - 플레이어의 X 위치
     * @param {number} deltaTime - 프레임 시간 간격
     */
    smoothUpdate(playerX, deltaTime) {
        // 목표 위치 계산
        this.targetX = this.calculateTargetX(playerX);
        
        // 즉시 위치 동기화 (스무딩 없음)
        this.currentX = this.targetX;
        this.velocity = 0; // 속도 초기화
    }
    
    /**
     * 목표 X 위치 계산 (경계 처리 포함)
     * @param {number} playerX - 플레이어의 X 위치
     * @returns {number} 제한된 목표 X 위치
     */
    calculateTargetX(playerX) {
        // 플레이어 위치를 그대로 따라감
        return playerX;
    }
    
    /**
     * 기본 위치로 부드럽게 복귀
     * @param {number} deltaTime - 프레임 시간 간격
     */
    returnToBasePosition(deltaTime) {
        // 기본 위치(0)로 부드럽게 복귀
        const spring = (0 - this.currentX) * this.config.followSpeed;
        const damping = this.velocity * this.config.damping;
        
        this.velocity += (spring - damping) * deltaTime;
        this.currentX += this.velocity * deltaTime;
        
        // 카메라 위치 적용
        this.camera.position.x = this.basePosition.x + this.currentX;
    }
    
    /**
     * 카메라 추적 활성화/비활성화
     * @param {boolean} enabled - 활성화 여부
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled) {
            // 비활성화 시 속도 초기화
            this.velocity = 0;
        }
    }
    
    /**
     * 카메라를 즉시 특정 위치로 이동
     * @param {number} x - X 위치
     */
    setImmediatePosition(x) {
        this.currentX = x;
        this.targetX = x;
        this.velocity = 0;
        this.camera.position.x = this.basePosition.x + x;
    }
    
    /**
     * 현재 카메라 추적 상태 반환
     * @returns {Object} 카메라 상태 정보
     */
    getState() {
        return {
            enabled: this.enabled,
            currentX: this.currentX,
            targetX: this.targetX,
            velocity: this.velocity,
            cameraX: this.camera.position.x
        };
    }
}