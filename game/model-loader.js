import { scene } from './scene-setup.js';
import { createClouds } from './scene-setup.js';

// 모델 변수들
let _player = null;
export let mixer = null;
export let introRaccoon = null;

// player getter/setter
export function getPlayer() {
    return _player;
}

export function setPlayer(newPlayer) {
    _player = newPlayer;
}

// 호환성을 위한 player export (deprecated)
export { _player as player };

export let bushModel = null;
export let bushLargeModel = null;
export let bushFlowersModel = null;
export let personModel = null;

// Person 모델 로드
export function loadPersonModel() {
    loader.setPath('obstacle/');
    loader.load(
        'Person.gltf',
        function (gltf) {
            personModel = gltf.scene;
            personModel.traverse(node => {
                if (node.isMesh) {
                    node.castShadow = true;
                    // 사람 캐릭터를 밝게 만들기
                    if (node.material) {
                        if (Array.isArray(node.material)) {
                            node.material.forEach(mat => {
                                mat.emissive = new THREE.Color(0x666666); // 적당히 밝은 발광 효과
                                mat.emissiveIntensity = 0.8;
                            });
                        } else {
                            node.material.emissive = new THREE.Color(0x666666); // 적당히 밝은 발광 효과
                            node.material.emissiveIntensity = 0.8;
                        }
                    }
                }
            });
            const box = new THREE.Box3().setFromObject(personModel);
            const size = box.getSize(new THREE.Vector3());
            const scale = (4 / size.y) * 0.8;
            personModel.scale.set(scale, scale, scale);
            personModel.position.y = 0;

            // 사람이 플레이어 쪽을 바라보도록 180도 더 회전
            personModel.rotation.y = Math.PI / 2 + Math.PI;
        },
        undefined,
        function (error) {
            console.error('Person 모델 로딩 중 오류 발생:', error);
            // 폴백으로 기본 박스 생성
            const geometry = new THREE.BoxGeometry(2, 4, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0x0066cc });
            personModel = new THREE.Mesh(geometry, material);
            personModel.castShadow = true;
            personModel.position.y = 2;
            personModel.rotation.y = Math.PI / 2;
        }
    );
}

export let holeModel = null;
export let rockModel = null;
export let cloudModel = null;
export let treeModel = null;

// 로더
const loader = new THREE.GLTFLoader();
const clock = new THREE.Clock();

// 플레이어 모델 로드
export function loadPlayerModel(modelPath, modelType) {
    loader.setPath('');

    let currentPlayerX = 0;
    if (_player) {
        currentPlayerX = _player.position.x;
    }

    // 기존 플레이어 모델이 있으면 제거
    if (_player) {
        scene.remove(_player);
        _player = null;
        if (mixer) {
            mixer.stopAllAction();
            mixer = null;
        }
    }

    loader.load(
        modelPath,
        function (gltf) {
            console.log(`성공: ${modelPath} 모델을 불러왔습니다.`);
            _player = gltf.scene;

            const box = new THREE.Box3().setFromObject(_player);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            _player.position.sub(center);

            let scale;
            if (modelType === 'tiger') {
                scale = (2.5 / size.y) / 50;
            } else if (modelType === 'elephant') {
                scale = (2.5 / size.y) * 3;
            } else if (modelType === 'rabbit') {
                scale = (2.5 / size.y) / 65;
            } else if (modelType === 'snake') {
                scale = (2.5 / size.y) / 6;
            } else if (modelType === 'raccoon') {
                scale = (2.5 / size.y) / 60;
            }
            _player.scale.set(scale, scale, scale);

            _player.position.set(currentPlayerX, 1.5, 12);
            _player.rotation.y = Math.PI;
            _player.traverse(node => { if (node.isMesh) node.castShadow = true; });

            // 애니메이션 설정
            mixer = new THREE.AnimationMixer(_player);
            const clips = gltf.animations;
            console.log(`모델 ${modelPath}의 애니메이션 클립:`, clips.map(clip => clip.name));

            if (clips && clips.length) {
                let animationClip = null;
                const possibleNames = ['run', 'Run', 'walk', 'Walk', 'Walking'];
                for (const name of possibleNames) {
                    animationClip = THREE.AnimationClip.findByName(clips, name);
                    if (animationClip) break;
                }

                if (animationClip) {
                    const action = mixer.clipAction(animationClip);
                    action.play();
                } else {
                    console.warn(`"${modelPath}"에서 적절한 애니메이션 클립(run, walk 등)을 찾을 수 없습니다. 첫 번째 애니메이션을 재생합니다.`);
                    const defaultAction = mixer.clipAction(clips[0]);
                    defaultAction.play();
                }
            } else {
                console.warn(`"${modelPath}"에 애니메이션이 없습니다.`);
            }

            _player.userData.modelPath = modelPath;
            scene.add(_player);
        },
        undefined,
        function (error) {
            console.error(`모델 로딩 중 심각한 오류 발생: ${modelPath}`, error);
        }
    );
}

// 인트로 너구리 모델 로드
export function loadIntroRaccoon(onLoadComplete) {
    loader.setPath('');
    loader.load(
        'animal/raccoon_Walking.glb',
        function (gltf) {
            console.log("성공: 인트로 너구리 모델을 불러왔습니다.");
            introRaccoon = gltf.scene;
            const box = new THREE.Box3().setFromObject(introRaccoon);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            introRaccoon.position.sub(center);
            const scale = (2.5 / size.y) / 60;
            introRaccoon.scale.set(scale, scale, scale);
            introRaccoon.position.set(0, 1.5, 12);
            introRaccoon.rotation.y = Math.PI;
            introRaccoon.traverse(node => { if (node.isMesh) node.castShadow = true; });
            scene.add(introRaccoon);

            // 애니메이션 설정
            mixer = new THREE.AnimationMixer(introRaccoon);
            const clips = gltf.animations;
            if (clips && clips.length) {
                let animationClip = THREE.AnimationClip.findByName(clips, 'Walk');
                if (!animationClip) {
                    animationClip = THREE.AnimationClip.findByName(clips, 'run');
                }
                if (animationClip) {
                    const action = mixer.clipAction(animationClip);
                    action.play();
                } else {
                    console.warn("인트로 너구리 모델에서 적절한 애니메이션 클립(run, walk 등)을 찾을 수 없습니다. 첫 번째 애니메이션을 재생합니다.");
                    const defaultAction = mixer.clipAction(clips[0]);
                    defaultAction.play();
                }
            } else {
                console.warn("인트로 너구리 모델에 애니메이션이 없습니다.");
            }

            if (onLoadComplete) onLoadComplete();
        },
        undefined,
        function (error) {
            console.error('인트로 너구리 모델 로딩 중 오류 발생:', error);
        }
    );
}



// Bush 모델 로드
export function loadBushModel() {
    loader.setPath('background/');
    loader.load(
        'Bush.gltf',
        function (gltf) {
            console.log("성공: Bush.gltf 모델을 불러왔습니다.");
            bushModel = gltf.scene;
            bushModel.traverse(node => { if (node.isMesh) node.castShadow = true; });
            const box = new THREE.Box3().setFromObject(bushModel);
            const size = box.getSize(new THREE.Vector3());
            const scale = (4 / size.y) * 2;
            bushModel.scale.set(scale, scale, scale);
            bushModel.position.y = 1.5;
        },
        undefined,
        function (error) {
            console.error('Bush 모델 로딩 중 오류 발생:', error);
        }
    );
}

// Bush Large 모델 로드
export function loadBushLargeModel() {
    loader.setPath('background/');
    loader.load(
        'Bush_Large.gltf',
        function (gltf) {
            console.log("성공: Bush_Large.gltf 모델을 불러왔습니다.");
            bushLargeModel = gltf.scene;
            bushLargeModel.traverse(node => { if (node.isMesh) node.castShadow = true; });
            const box = new THREE.Box3().setFromObject(bushLargeModel);
            const size = box.getSize(new THREE.Vector3());
            const scale = (4 / size.y) * 2.5;
            bushLargeModel.scale.set(scale, scale, scale);
            bushLargeModel.position.y = 1.5;
        },
        undefined,
        function (error) {
            console.error('Bush_Large 모델 로딩 중 오류 발생:', error);
        }
    );
}

// Bush Flowers 모델 로드
export function loadBushFlowersModel() {
    loader.setPath('background/');
    loader.load(
        'Bush_Flowers.gltf',
        function (gltf) {
            console.log("성공: Bush_Flowers.gltf 모델을 불러왔습니다.");
            bushFlowersModel = gltf.scene;
            bushFlowersModel.traverse(node => { if (node.isMesh) node.castShadow = true; });
            const box = new THREE.Box3().setFromObject(bushFlowersModel);
            const size = box.getSize(new THREE.Vector3());
            const scale = (4 / size.y) * 2.5;
            bushFlowersModel.scale.set(scale, scale, scale);
            bushFlowersModel.position.y = 1.5;
        },
        undefined,
        function (error) {
            console.error('Bush_Flowers 모델 로딩 중 오류 발생:', error);
        }
    );
}



// Hole 모델 로드
export function loadHoleModel() {
    loader.setPath('obstacle/');
    loader.load(
        'hole.gltf',
        function (gltf) {
            console.log("성공: hole.gltf 모델을 불러왔습니다.");
            holeModel = gltf.scene;
            holeModel.traverse(node => { if (node.isMesh) node.castShadow = true; });
            const box = new THREE.Box3().setFromObject(holeModel);
            const size = box.getSize(new THREE.Vector3());
            const scale = (4 / size.y) * 0.8;
            holeModel.scale.set(scale, scale, scale);
            holeModel.position.y = 0;
        },
        undefined,
        function (error) {
            console.error('hole 모델 로딩 중 오류 발생:', error);
        }
    );
}

// Rock 모델 로드
export function loadRockModel() {
    loader.setPath('obstacle/');
    loader.load(
        'Rock.gltf',
        function (gltf) {
            console.log("성공: Rock.gltf 모델을 불러왔습니다.");
            rockModel = gltf.scene;

            // 모델의 중심점 조정
            const box = new THREE.Box3().setFromObject(rockModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            rockModel.position.sub(center); // 중심점을 원점으로 이동

            rockModel.traverse(node => { if (node.isMesh) node.castShadow = true; });
            const scale = (4 / size.y) * 0.8;
            rockModel.scale.set(scale, scale, scale);
            rockModel.position.y = 0;
        },
        undefined,
        function (error) {
            console.error('Rock 모델 로딩 중 오류 발생:', error);
        }
    );
}

// Cloud 모델 로드
export function loadCloudModel() {
    loader.setPath('background/');
    loader.load(
        'cloud.glb',
        function (gltf) {
            console.log("성공: cloud.glb 모델을 불러왔습니다.");
            cloudModel = gltf.scene;
            cloudModel.traverse(node => { if (node.isMesh) node.castShadow = true; });
            const box = new THREE.Box3().setFromObject(cloudModel);
            const size = box.getSize(new THREE.Vector3());
            const scale = (4 / size.y) * 2.5;
            cloudModel.scale.set(scale, scale, scale);
            cloudModel.rotation.y = Math.PI / 2;

            // 구름 생성
            createClouds(cloudModel);
        },
        undefined,
        function (error) {
            console.error('cloud.glb 모델 로딩 중 오류 발생:', error);
        }
    );
}

// Tree 모델 로드
export function loadTreeModel() {
    loader.setPath('background/stylized_tree/');
    loader.load(
        'scene.gltf',
        function (gltf) {
            console.log("성공: stylized_tree 모델을 불러왔습니다.");
            treeModel = gltf.scene;
            treeModel.traverse(node => { if (node.isMesh) node.castShadow = true; });
            const box = new THREE.Box3().setFromObject(treeModel);
            const size = box.getSize(new THREE.Vector3());
            const scale = (6 / size.y) * 1.0; // 나무 크기를 더 작게 조정
            treeModel.scale.set(scale, scale, scale);
            treeModel.position.y = 0; // 바닥에 붙임

            // 나무 모델이 로드되면 랜덤 배치 시작
            import('./scene-setup.js').then(module => {
                if (module.createRandomTrees) {
                    module.createRandomTrees(treeModel);
                }
            }).catch(error => {
                console.error('scene-setup.js 모듈 로드 실패:', error);
            });
        },
        undefined,
        function (error) {
            console.error('stylized_tree 모델 로딩 중 오류 발생:', error);
        }
    );
}

// 모든 모델 로드 시작
export function loadAllModels() {
    loadBushModel();
    loadBushLargeModel();
    loadBushFlowersModel();
    loadPersonModel();
    loadHoleModel();
    loadRockModel();
    loadCloudModel();
    loadTreeModel(); // 나무 모델 로드 추가
}

// 인트로 너구리를 플레이어로 설정하는 함수
export function setPlayerFromIntroRaccoon() {
    if (introRaccoon) {
        _player = introRaccoon;
        _player.userData.modelPath = 'animal/raccoon_Walking.glb';
        introRaccoon = null; // 인트로 너구리 참조 제거
        console.log("인트로 너구리가 플레이어로 설정되었습니다!");
        return true;
    }
    console.log("인트로 너구리가 없어서 플레이어로 설정할 수 없습니다.");
    return false;
}

// 애니메이션 믹서 업데이트
export function updateMixer(deltaTime) {
    if (mixer) {
        mixer.update(deltaTime);
    }
}

export { clock };

// 플레이어 모델을 동적으로 변경하는 함수
export function changePlayerModel(modelPath) {
    console.log(`🔧 changePlayerModel 호출: ${modelPath}`);

    // 파일명에서 동물 타입 추출
    const fileName = modelPath.split('/').pop(); // 'elephant_Walking.glb' 또는 'snake.glb'
    console.log(`📁 파일명: ${fileName}`);

    let modelType;
    if (fileName.includes('_')) {
        modelType = fileName.split('_')[0]; // 'elephant_Walking.glb' → 'elephant'
    } else {
        modelType = fileName.split('.')[0]; // 'snake.glb' → 'snake'
    }

    console.log(`🏷️ 추출된 모델 타입: ${modelType}`);

    loadPlayerModel(modelPath, modelType);
}