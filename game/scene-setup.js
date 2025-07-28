import { GAME_CONFIG, CALCULATED_VALUES } from './config.js';
import { CameraFollowSystem } from './camera-follow-system.js';

// Three.js 기본 요소들
export let scene, camera, renderer;
export let grounds = [];
export let clouds = [];

// 카메라 추적 시스템
export let cameraFollowSystem = null;

// 초기화 완료 플래그
let initialized = false;

// 텍스처 캐시
let sandTexture = null;
let grassTexture = null;

/**
 * Canvas 2D API를 사용하여 모래 텍스처를 생성합니다.
 * 향후 확장을 위한 선택적 텍스처 기반 구현입니다.
 * @returns {THREE.CanvasTexture} 생성된 모래 텍스처
 */
function createSandTexture() {
    // 이미 생성된 텍스처가 있으면 재사용
    if (sandTexture) {
        return sandTexture;
    }

    try {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');

        // 기본 모래색 배경 (자연스러운 모래색)
        context.fillStyle = '#F4A460'; // Sandy Brown
        context.fillRect(0, 0, 128, 128);

        // 모래 입자 효과를 위한 노이즈 패턴 추가
        const imageData = context.getImageData(0, 0, 128, 128);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // 약간의 랜덤 변화를 주어 자연스러운 모래 질감 생성
            const variation = (Math.random() - 0.5) * 30;
            data[i] = Math.max(0, Math.min(255, data[i] + variation));     // Red
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + variation)); // Green  
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + variation)); // Blue
        }

        context.putImageData(imageData, 0, 0);

        // Three.js CanvasTexture 생성
        sandTexture = new THREE.CanvasTexture(canvas);
        sandTexture.wrapS = THREE.RepeatWrapping;
        sandTexture.wrapT = THREE.RepeatWrapping;
        sandTexture.repeat.set(4, 4); // 텍스처 반복으로 더 자연스러운 효과

        return sandTexture;
    } catch (error) {
        console.warn('모래 텍스처 생성 실패, 기본 색상을 사용합니다:', error);
        return null;
    }
}

// 자연스러운 잔디 텍스처 생성 함수
function createGrassColorTexture() {
    // console.log('자연스러운 잔디 텍스처 생성 중...');
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    // 기본 잔디 색상 (어둡고 초록색)
    context.fillStyle = '#2E7D32'; // 어두운 초록색
    context.fillRect(0, 0, 128, 128);

    // 잔디 패턴 생성 - 어두운 초록색 팔레트
    const grassColors = [
        '#388E3C', // 밝은 어두운 초록
        '#1B5E20', // 매우 어두운 초록
        '#2E7D32', // 기본 어두운 초록
        '#43A047', // 중간 초록
        '#4CAF50'  // 연한 초록
    ];

    // 잔디 텍스처 패턴 생성 (연하게)
    for (let i = 0; i < 150; i++) { // 패턴 수 줄임
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const size = Math.random() * 2 + 1; // 크기 줄임
        const color = grassColors[Math.floor(Math.random() * grassColors.length)];
        context.fillStyle = color;
        context.globalAlpha = 0.3; // 투명도 높임 (더 연하게)
        context.fillRect(x, y, size, size);
    }

    // 잔디 줄기 효과 (연하게)
    context.globalAlpha = 0.2; // 투명도 높임
    for (let i = 0; i < 25; i++) { // 줄기 수 줄임
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const height = Math.random() * 6 + 1; // 높이 줄임
        context.fillStyle = '#4CAF50';
        context.fillRect(x, y, 1, height);
    }

    context.globalAlpha = 1.0;
    grassTexture = new THREE.CanvasTexture(canvas);
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(6, 12); // 더 세밀한 반복

    updateGroundTexture();
    // console.log('자연스러운 잔디 텍스처 적용 완료');
}

// 바닥 텍스처 업데이트 함수
function updateGroundTexture() {
    if (!grassTexture) return;
    
    // 외부 바닥들(왼쪽, 오른쪽)에만 잔디 텍스처 적용
    grounds.forEach((ground, index) => {
        // 메인 바닥(인덱스 0, 1)은 건드리지 않고, 외부 바닥들에만 적용
        if (index >= 2) { // 외부 바닥들 (왼쪽, 오른쪽)
            ground.material.map = grassTexture;
            ground.material.needsUpdate = true;
        }
    });
}

// DOM 요소들
export const gameContainer = document.getElementById('game-container');
export const rainbowProgressBar = document.getElementById('rainbow-progress-bar');
export const emojiIndicator = document.getElementById('emoji-indicator');

// 초기화 함수
export function initializeScene() {
    // Scene 생성
    scene = new THREE.Scene();
    scene.background = new THREE.Color(GAME_CONFIG.skyColor);
    scene.fog = new THREE.Fog(GAME_CONFIG.skyColor, 50, 150);

    // Camera 생성
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(
        GAME_CONFIG.introInitialCameraPosition.x,
        GAME_CONFIG.introInitialCameraPosition.y,
        GAME_CONFIG.introInitialCameraPosition.z
    );

    // Renderer 생성
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    gameContainer.appendChild(renderer.domElement);

    // 조명 설정
    setupLighting();
    
    // 바닥 생성
    createGrounds();
    
    // 잔디 텍스처 생성 및 적용
    createGrassColorTexture();
    
    // 카메라 추적 시스템 초기화
    initializeCameraFollowSystem();

    // 경찰 모델 로드
    loadPoliceModel();
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(
        GAME_CONFIG.ambientLightColor, 
        GAME_CONFIG.ambientLightIntensity
    );
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
        GAME_CONFIG.directionalLightColor, 
        GAME_CONFIG.directionalLightIntensity
    );
    directionalLight.position.set(
        GAME_CONFIG.directionalLightPosition.x,
        GAME_CONFIG.directionalLightPosition.y,
        GAME_CONFIG.directionalLightPosition.z
    );
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(GAME_CONFIG.groundWidth, GAME_CONFIG.groundSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: '#F4C78A' }); // 자연스러운 모래색 적용
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = false;
    return ground;
}

function createOuterGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, GAME_CONFIG.groundSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: GAME_CONFIG.outerGroundColor });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = false;
    return ground;
}

function createGrounds() {
    // 메인 바닥
    const ground1 = createGround();
    const ground2 = createGround();
    ground2.position.z = -GAME_CONFIG.groundSize;
    grounds.push(ground1, ground2);
    scene.add(ground1, ground2);

    // 왼쪽 외부 바닥
    const outerGroundLeft1 = createOuterGround();
    outerGroundLeft1.position.x = -115;
    const outerGroundLeft2 = createOuterGround();
    outerGroundLeft2.position.x = -115;
    outerGroundLeft2.position.z = -GAME_CONFIG.groundSize;
    grounds.push(outerGroundLeft1, outerGroundLeft2);
    scene.add(outerGroundLeft1, outerGroundLeft2);

    // 오른쪽 외부 바닥
    const outerGroundRight1 = createOuterGround();
    outerGroundRight1.position.x = 115;
    const outerGroundRight2 = createOuterGround();
    outerGroundRight2.position.x = 115;
    outerGroundRight2.position.z = -GAME_CONFIG.groundSize;
    grounds.push(outerGroundRight1, outerGroundRight2);
    scene.add(outerGroundRight1, outerGroundRight2);
}

// 카메라 추적 시스템 초기화
function initializeCameraFollowSystem() {
    if (!camera) {
        console.error('카메라가 초기화되지 않았습니다.');
        return;
    }
    
    // 카메라 추적 설정에 맵 경계 정보 추가
    const cameraConfig = {
        ...GAME_CONFIG.cameraFollow,
        mapBoundary: CALCULATED_VALUES.mapBoundary
    };
    
    // 카메라 추적 시스템 생성
    cameraFollowSystem = new CameraFollowSystem(camera, cameraConfig);
    
    console.log('카메라 추적 시스템이 초기화되었습니다.');
}

// 구름 생성 함수 (model-loader에서 호출됨)
export function createClouds(cloudModel) {
    for (let i = 0; i < 15; i++) {
        const cloud = cloudModel.clone();
        cloud.position.set(
            (Math.random() - 0.5) * 200,
            Math.random() * 15 + 20,
            (Math.random() - 0.5) * 400 - 200
        );
        clouds.push(cloud);
        scene.add(cloud);
    }
}

// 윈도우 리사이즈 처리
export function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);

// GLTFLoader 및 FBXLoader 추가
const gltfLoader = new THREE.GLTFLoader();
const fbxLoader = new THREE.FBXLoader();

// Zoo 배경 변수
export let zooBackground = null;

// Zoo 배경 로드 함수 (인트로용)
export function loadZooBackground() {
    gltfLoader.load(
        'background/zoo.glb',
        function (gltf) {
            zooBackground = gltf.scene;

            // 배경 크기와 위치 조정
            const box = new THREE.Box3().setFromObject(zooBackground);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            // 배경을 적절한 크기로 조정
            const scale = 25 / Math.max(size.x, size.y, size.z); // 적절한 크기로 스케일링
            zooBackground.scale.set(scale, scale, scale);

            // Zoo 배경을 180도 회전 (Y축 기준)
            zooBackground.rotation.y = Math.PI; // 180도 회전

            // 배경을 바닥에 붙이고 뒤쪽에 배치 (동물원 입구 느낌)
            zooBackground.position.set(0, -0.5, 40); // 바닥에 붙이고 너구리에서 더 멀리 배치

            // 그림자 설정
            zooBackground.traverse(node => {
                if (node.isMesh) {
                    node.castShadow = false;
                    node.receiveShadow = false;
                }
            });

            // 인트로에서만 보이도록 설정
            zooBackground.visible = true;
            scene.add(zooBackground);
        },
        function (xhr) {
            // 로딩 진행률 (필요시 주석 해제)
        },
        function (error) {
            console.error('Zoo 배경 로딩 중 오류 발생:', error);
        }
    );
}

// 러닝맨 모델 로드 함수 (경찰 대신)
export function loadPoliceModel() {
    gltfLoader.load(
        'obstacle/running.glb',
        function (gltf) {
            const runningMan = gltf.scene;
            
            // 모델 크기, 위치, 회전 조정
            runningMan.scale.set(2, 2, 2); // GLTF는 보통 더 큰 스케일 필요
            runningMan.position.set(0, 0, 30); // zoo 배경 앞쪽 중앙길에 배치
            runningMan.rotation.y = Math.PI; // 180도 회전

            // 그림자 설정
            runningMan.traverse(node => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });

            console.log('Running man model loaded successfully');
            
            // 애니메이션 이름 변경 및 애니메이션 믹서 설정
            if (gltf.animations && gltf.animations.length > 0) {
                gltf.animations[0].name = "mixamo.com"; // 첫 번째 애니메이션 클립의 이름을 변경
                const mixer = new THREE.AnimationMixer(runningMan);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                runningMan.userData.mixer = mixer; // 애니메이션 믹서를 userData에 저장
                console.log('Animation action played:', action.isRunning());
            }

            // 러닝맨을 월드 스피드에 따라 움직이도록 설정
            runningMan.userData.isScenery = true; 
            runningMan.userData.isRunningMan = true; // 러닝맨임을 식별하는 플래그 추가 
            
            // obstacle-manager.js에서 sceneryObjects 가져오기
            import('./obstacle-manager.js').then(module => {
                const { sceneryObjects } = module;
                sceneryObjects.push(runningMan);
                console.log('Running man added to sceneryObjects for world speed movement.');
            }).catch(error => {
                console.error('obstacle-manager.js 모듈 로드 실패:', error);
            });

            console.log('Running man animations:', gltf.animations.map(clip => clip.name));
            console.log('Running man position:', runningMan.position);
            scene.add(runningMan);

            // 5초 후에 러닝맨 모델 제거
            setTimeout(() => {
                scene.remove(runningMan);
                // sceneryObjects 배열에서도 제거 (필요하다면)
                import('./obstacle-manager.js').then(module => {
                    const index = module.sceneryObjects.indexOf(runningMan);
                    if (index > -1) {
                        module.sceneryObjects.splice(index, 1);
                    }
                }).catch(error => {
                    console.error('obstacle-manager.js 모듈 로드 실패:', error);
                });
                console.log('Running man model removed after 5 seconds.');
            }, 7000);
        },
        function (xhr) {
            // 로딩 진행률 (필요시 주석 해제)
        },
        function (error) {
            console.error('러닝맨 모델 로딩 중 오류 발생:', error);
        }
    );
}

// Zoo 배경 숨기기 함수 (게임 시작 시 호출)
export function hideZooBackground() {
    if (zooBackground) {
        zooBackground.visible = false;
        console.log('Zoo 배경 숨김 처리 완료');
    }
}

// Zoo 배경 보이기 함수 (인트로 시 호출)
export function showZooBackground() {
    if (zooBackground) {
        zooBackground.visible = true;
        console.log('Zoo 배경 표시 처리 완료');
    }
}

// 나무 랜덤 배치 함수 (bush처럼 사이드에 랜덤 배치)
export function createRandomTrees(treeModel) {
    if (!treeModel) return;
    
    const numTrees = 30; // 나무 개수
    const minDistance = 25; // bush와 나무 간 최소 거리
    
    // obstacle-manager.js에서 sceneryObjects 가져오기
    import('./obstacle-manager.js').then(module => {
        const { sceneryObjects } = module;
        
        for (let i = 0; i < numTrees; i++) {
            let attempts = 0;
            let validPosition = false;
            let treePosition;
            
            // 최대 50번 시도해서 bush와 겹치지 않는 위치 찾기
            while (!validPosition && attempts < 50) {
                const side = Math.random() < 0.5 ? -1 : 1; // 왼쪽 또는 오른쪽에 배치
                const minDistanceFromCenter = GAME_CONFIG.groundWidth / 2 + 10; // 게임 경로에서 최소 10만큼 떨어진 거리
                
                treePosition = {
                    x: side * (minDistanceFromCenter + Math.random() * 80), // 게임 경로 밖에만 배치 (더 넓게)
                    y: 0, // y 위치 - 바닥에 붙임
                    z: (Math.random() - 0.5) * GAME_CONFIG.groundSize * 4 // z 위치 랜덤
                };
                
                // 기존 bush들과의 거리 체크
                validPosition = true;
                for (const sceneryObj of sceneryObjects) {
                    const distance = Math.sqrt(
                        Math.pow(treePosition.x - sceneryObj.position.x, 2) +
                        Math.pow(treePosition.z - sceneryObj.position.z, 2)
                    );
                    
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            // 유효한 위치를 찾았거나 최대 시도 횟수에 도달한 경우 나무 생성
            if (validPosition || attempts >= 50) {
                const tree = treeModel.clone();
                
                tree.position.set(treePosition.x, treePosition.y, treePosition.z);
                
                // 랜덤 회전 추가
                tree.rotation.y = Math.random() * Math.PI * 2;
                
                // 나무가 월드 스피드에 따라 움직이도록 설정 (bush와 동일하게)
                tree.userData.isScenery = true;
                
                scene.add(tree);
                
                // sceneryObjects 배열에 추가해서 월드 스피드로 이동하도록 함
                sceneryObjects.push(tree);
            }
        }
        
        console.log(`총 ${numTrees}그루의 나무 랜덤 배치 완료 (bush와 겹치지 않게)`);
    }).catch(error => {
        console.error('obstacle-manager.js 모듈 로드 실패:', error);
        
        // 모듈 로드 실패 시 기본 방식으로 나무 생성
        for (let i = 0; i < numTrees; i++) {
            const tree = treeModel.clone();
            
            const side = Math.random() < 0.5 ? -1 : 1;
            const minDistanceFromCenter = GAME_CONFIG.groundWidth / 2 + 10;
            
            tree.position.set(
                side * (minDistanceFromCenter + Math.random() * 80),
                0,
                (Math.random() - 0.5) * GAME_CONFIG.groundSize * 4
            );
            
            tree.rotation.y = Math.random() * Math.PI * 2;
            tree.userData.isScenery = true;
            
            scene.add(tree);
        }
        
        console.log(`총 ${numTrees}그루의 나무 기본 방식으로 배치 완료`);
    });
}

// 중앙길에 단일 색상 적용 함수
function applySolidRoadColor() {
    grounds.forEach((ground, index) => {
        // 중앙길에만 단일 색상 적용 (인덱스 0,1)
        if (index < 2) {
            ground.material = new THREE.MeshStandardMaterial({
                color: GAME_CONFIG.groundColor // config.js에서 설정된 중앙길 색상 사용
            });
        }
    });
}