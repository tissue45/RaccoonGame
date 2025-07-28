import { scene, camera, renderer } from './scene-setup.js';
import { GAME_CONFIG } from './config.js';

// 엔딩 시퀀스 관련 변수들
let isEndingActive = false;
let endingStartTime = 0;
let originalCameraPosition = null;
let originalCameraRotation = null;
let endingCamera = null;
let endingAnimals = [];
let endingTrees = [];
let endingGround = null;

// 엔딩 시퀀스 시작
export function startEndingSequence() {
    if (isEndingActive) return;

    console.log("엔딩 시퀀스 시작!");
    isEndingActive = true;
    endingStartTime = performance.now();

    // 현재 카메라 위치 저장
    originalCameraPosition = camera.position.clone();
    originalCameraRotation = camera.rotation.clone();

    // 엔딩 씬 설정
    setupEndingScene();

    // 카메라를 정면 시점으로 이동
    setupEndingCamera();

    // 엔딩 애니메이션 시작
    animateEndingSequence();
}

// 엔딩 씬 설정
function setupEndingScene() {
    // 사이드길 초원 바닥 생성 (자연스러운 초록색)
    const groundGeometry = new THREE.PlaneGeometry(200, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: '#4CAF50' // 자연스러운 초록색 초원
    });
    endingGround = new THREE.Mesh(groundGeometry, groundMaterial);
    endingGround.rotation.x = -Math.PI / 2;
    endingGround.position.set(0, -0.5, -30);
    scene.add(endingGround);

    // 사이드 나무들 생성
    createEndingTrees();

    // 엔딩용 동물들 생성
    createEndingAnimals();
}

// 엔딩 카메라 설정 (정면 시점)
function setupEndingCamera() {
    // 카메라를 정면에서 사이드길을 바라보도록 설정
    camera.position.set(0, 10, 20); // 정면, 약간 위에서
    camera.lookAt(0, 0, -30); // 사이드길 중앙을 바라봄

    // 부드러운 카메라 전환을 위한 애니메이션
    const startPos = originalCameraPosition.clone();
    const endPos = new THREE.Vector3(0, 10, 20);

    let progress = 0;
    const transitionDuration = 2000; // 2초

    function animateCamera() {
        progress += 16; // 60fps 기준
        const alpha = Math.min(progress / transitionDuration, 1);

        // 부드러운 이동
        camera.position.lerpVectors(startPos, endPos, alpha);
        camera.lookAt(0, 0, -30);

        if (alpha < 1) {
            requestAnimationFrame(animateCamera);
        }
    }

    animateCamera();
}

// 엔딩용 나무들 생성
function createEndingTrees() {
    // 나무 모델이 로드되어 있는지 확인
    import('./model-loader.js').then(module => {
        const { treeModel } = module;

        if (treeModel) {
            // 사이드에 나무들 배치
            for (let i = 0; i < 10; i++) {
                const tree = treeModel.clone();

                // 사이드 나무 크기 설정
                const scale = 1.5; // 엔딩용으로 조금 더 크게
                tree.scale.multiplyScalar(scale);

                // 양쪽 사이드에 배치
                const side = i % 2 === 0 ? -1 : 1;
                tree.position.set(
                    side * (30 + Math.random() * 20), // 양쪽 사이드
                    0,
                    -50 + i * 10 // 일정한 간격으로 배치
                );

                // 랜덤 회전
                tree.rotation.y = Math.random() * Math.PI * 2;

                scene.add(tree);
                endingTrees.push(tree);
            }
        }
    }).catch(error => {
        console.error('나무 모델 로드 실패:', error);
    });
}

// 엔딩용 동물들 생성
function createEndingAnimals() {
    const animalPaths = [
        'animal/raccoon_Walking.glb',
        'animal/tiger_Walking.glb',
        'animal/rabbit_Walkng.glb',
        'animal/snake.glb',
        'animal/elephant_Walking.glb'
    ];

    const animalTypes = ['raccoon', 'tiger', 'rabbit', 'snake', 'elephant'];
    const animalEmojis = ['🦝', '🐯', '🐇', '🐍', '🐘'];

    const loader = new THREE.GLTFLoader();

    animalPaths.forEach((path, index) => {
        loader.load(path, (gltf) => {
            const animal = gltf.scene;
            const animalType = animalTypes[index];

            // 동물 크기 설정
            const box = new THREE.Box3().setFromObject(animal);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            animal.position.sub(center);

            let scale;
            if (animalType === 'tiger') {
                scale = (2.5 / size.y) / 50;
            } else if (animalType === 'elephant') {
                scale = (2.5 / size.y) * 3;
            } else if (animalType === 'rabbit') {
                scale = (2.5 / size.y) / 65;
            } else if (animalType === 'snake') {
                scale = (2.5 / size.y) / 6;
            } else if (animalType === 'raccoon') {
                scale = (2.5 / size.y) / 60;
            }
            animal.scale.set(scale, scale, scale);

            // 동물들을 일렬로 배치
            animal.position.set(
                (index - 2) * 8, // 중앙을 기준으로 좌우 배치
                1.5,
                -30
            );

            animal.rotation.y = 0; // 정면을 바라보도록
            animal.traverse(node => {
                if (node.isMesh) node.castShadow = true;
            });

            // 애니메이션 설정
            if (gltf.animations && gltf.animations.length) {
                const mixer = new THREE.AnimationMixer(animal);
                let animationClip = null;
                const possibleNames = ['run', 'Run', 'walk', 'Walk', 'Walking'];

                for (const name of possibleNames) {
                    animationClip = THREE.AnimationClip.findByName(gltf.animations, name);
                    if (animationClip) break;
                }

                if (animationClip) {
                    const action = mixer.clipAction(animationClip);
                    action.play();
                    animal.userData.mixer = mixer;
                }
            }

            scene.add(animal);
            endingAnimals.push(animal);

            console.log(`엔딩 동물 생성: ${animalEmojis[index]} ${animalType}`);
        });
    });
}

// 엔딩 애니메이션 업데이트
function animateEndingSequence() {
    if (!isEndingActive) return;

    const currentTime = performance.now();
    const elapsed = currentTime - endingStartTime;

    // 동물 애니메이션 업데이트
    endingAnimals.forEach(animal => {
        if (animal.userData.mixer) {
            animal.userData.mixer.update(0.016); // 60fps 기준
        }

        // 동물들이 천천히 앞으로 걸어오는 애니메이션
        animal.position.z += 0.02;
    });

    // 3초 후 축하 메시지 표시
    if (elapsed > 3000 && !document.getElementById('ending-message')) {
        showEndingMessage();
    }

    // 5초 후 게임 결과 화면 표시
    if (elapsed > 5000 && !document.getElementById('ending-result-screen')) {
        showEndingResultScreen();
    }

    requestAnimationFrame(animateEndingSequence);
}

// 엔딩 메시지 표시
function showEndingMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'ending-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 30px 50px;
        border-radius: 20px;
        font-size: 36px;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        animation: fadeIn 2s ease-in;
    `;

    messageDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">🏆</div>
        <div>축하합니다!</div>
        <div style="font-size: 24px; margin-top: 15px; color: #ffeb3b;">
            동물 러닝 게임 완주!
        </div>
    `;

    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(messageDiv);
}

// 엔딩 결과 화면 표시
function showEndingResultScreen() {
    const resultScreen = document.createElement('div');
    resultScreen.id = 'ending-result-screen';
    resultScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        animation: fadeIn 1s ease-in;
    `;

    const resultContainer = document.createElement('div');
    resultContainer.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        padding: 50px 40px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        text-align: center;
        animation: slideUp 1s ease-out;
    `;

    resultContainer.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 20px; animation: bounce 2s infinite;">🏆</div>
        <h1 style="font-size: 36px; color: #333; margin-bottom: 15px; font-weight: bold;">축하합니다!</h1>
        <p style="font-size: 20px; color: #666; margin-bottom: 25px;">동물 러닝 게임 완주!</p>
        
        <div style="display: flex; justify-content: center; gap: 15px; margin: 25px 0; flex-wrap: wrap;">
            <div style="font-size: 40px;" title="너구리 (주먹)">🦝</div>
            <div style="font-size: 40px;" title="호랑이 (1개)">🐯</div>
            <div style="font-size: 40px;" title="토끼 (2개)">🐇</div>
            <div style="font-size: 40px;" title="뱀 (3개)">🐍</div>
            <div style="font-size: 40px;" title="코끼리 (4개)">🐘</div>
        </div>
        
        <div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 15px; margin: 25px 0;">
            <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 16px;">
                <span style="color: #666;">🎯 게임 완료</span>
                <span style="color: #333; font-weight: bold;">성공!</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 16px;">
                <span style="color: #666;">🦝 기본 캐릭터</span>
                <span style="color: #333; font-weight: bold;">너구리</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 16px;">
                <span style="color: #666;">🔄 변신 동물</span>
                <span style="color: #333; font-weight: bold;">5종류</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 16px;">
                <span style="color: #666;">🎮 조작 방식</span>
                <span style="color: #333; font-weight: bold;">손가락 제스처</span>
            </div>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px; flex-wrap: wrap;">
            <button id="replay-btn" style="
                padding: 12px 25px;
                font-size: 16px;
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            ">🔄 다시 플레이</button>
            
            <button id="title-btn" style="
                padding: 12px 25px;
                font-size: 16px;
                background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            ">🏠 타이틀로 돌아가기</button>
        </div>
    `;

    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-15px); }
            60% { transform: translateY(-8px); }
        }
        #replay-btn:hover, #title-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);

    resultScreen.appendChild(resultContainer);
    document.body.appendChild(resultScreen);

    // 버튼 이벤트 리스너
    document.getElementById('replay-btn').onclick = () => location.reload();
    document.getElementById('title-btn').onclick = () => location.reload(); // 타이틀도 현재는 새로고침으로

    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            location.reload();
        }
    });
}

// 엔딩 시퀀스 정리
export function cleanupEndingSequence() {
    if (!isEndingActive) return;

    // 엔딩 요소들 제거
    endingAnimals.forEach(animal => {
        if (animal.parent) {
            animal.parent.remove(animal);
        }
    });

    endingTrees.forEach(tree => {
        if (tree.parent) {
            tree.parent.remove(tree);
        }
    });

    if (endingGround && endingGround.parent) {
        endingGround.parent.remove(endingGround);
    }

    // UI 요소들 제거
    const message = document.getElementById('ending-message');
    const resultScreen = document.getElementById('ending-result-screen');
    if (message) message.remove();
    if (resultScreen) resultScreen.remove();

    // 카메라 원래 위치로 복원
    if (originalCameraPosition && originalCameraRotation) {
        camera.position.copy(originalCameraPosition);
        camera.rotation.copy(originalCameraRotation);
    }

    // 변수 초기화
    isEndingActive = false;
    endingAnimals = [];
    endingTrees = [];
    endingGround = null;

    console.log("엔딩 시퀀스 정리 완료");
}

// 엔딩 시퀀스 활성 상태 확인
export function isEndingSequenceActive() {
    return isEndingActive;
}