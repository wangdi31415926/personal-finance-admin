<template>
  <div class="datacenter-container">
    <div ref="containerRef" class="threejs-container"></div>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div class="performance-panel" v-if="showPanel">
      <div class="panel-header">
        <h3>性能监控</h3>
        <button @click="showPanel = false" class="close-btn">×</button>
      </div>
      <div class="panel-content">
        <div class="metric-item">
          <div class="metric-label">CPU 使用率</div>
          <div class="metric-value">{{ performanceData.cpu }}%</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: performanceData.cpu + '%' }"></div>
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-label">内存使用率</div>
          <div class="metric-value">{{ performanceData.memory }}%</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: performanceData.memory + '%' }"></div>
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-label">网络流量</div>
          <div class="metric-value">{{ performanceData.network }} MB/s</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (performanceData.network / 100) * 100 + '%' }"></div>
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-label">温度</div>
          <div class="metric-value">{{ performanceData.temperature }}°C</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (performanceData.temperature / 80) * 100 + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="control-panel">
      <button @click="showPanel = !showPanel" class="control-btn">
        {{ showPanel ? '隐藏' : '显示' }}监控面板
      </button>
      <button @click="resetCamera" class="control-btn">重置视角</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

defineOptions({
  name: "DataCenterVisualization"
});

const containerRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const showPanel = ref(true);

const performanceData = ref({
  cpu: 45,
  memory: 62,
  network: 35,
  temperature: 42
});

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let animationId: number;
let patrolCharacter: THREE.Group;
let patrolPath: THREE.Vector3[] = [];
let patrolProgress = 0;
let serverRacks: THREE.Group[] = [];

// 初始化场景
const initScene = () => {
  if (!containerRef.value) return;

  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  scene.fog = new THREE.Fog(0x0a0a0a, 10, 200);

  // 创建相机
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(30, 25, 30);
  camera.lookAt(0, 0, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  containerRef.value.appendChild(renderer.domElement);

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 10;
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI / 2.2;

  // 创建环境
  createEnvironment();

  // 创建服务器机架
  createServerRacks();

  // 创建巡视小人
  createPatrolCharacter();

  // 创建性能监控面板
  createPerformancePanels();

  // 开始动画循环
  animate();

  loading.value = false;
};

// 创建机房环境
const createEnvironment = () => {
  // 地面
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // 添加地面网格
  const gridHelper = new THREE.GridHelper(100, 50, 0x00ff00, 0x003300);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // 墙面
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.7,
    metalness: 0.1
  });

  // 后墙
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 20),
    wallMaterial
  );
  backWall.position.set(0, 10, -50);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // 左墙
  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 20),
    wallMaterial
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-50, 10, 0);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // 右墙
  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 20),
    wallMaterial
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(50, 10, 0);
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // 天花板
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1
    })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 20;
  scene.add(ceiling);

  // 照明系统
  // 环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);

  // 主方向光
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
  mainLight.position.set(20, 30, 20);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 200;
  mainLight.shadow.camera.left = -50;
  mainLight.shadow.camera.right = 50;
  mainLight.shadow.camera.top = 50;
  mainLight.shadow.camera.bottom = -50;
  scene.add(mainLight);

  // 补充光源
  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
  fillLight.position.set(-20, 15, -20);
  scene.add(fillLight);

  // 顶部点光源（模拟天花板照明）
  for (let i = -40; i <= 40; i += 20) {
    for (let j = -40; j <= 40; j += 20) {
      const pointLight = new THREE.PointLight(0xffffff, 0.5, 30);
      pointLight.position.set(i, 18, j);
      pointLight.castShadow = true;
      scene.add(pointLight);
    }
  }
};

// 创建服务器机架
const createServerRacks = () => {
  const rackPositions = [
    { x: -30, z: -20 },
    { x: -10, z: -20 },
    { x: 10, z: -20 },
    { x: 30, z: -20 },
    { x: -30, z: 20 },
    { x: -10, z: 20 },
    { x: 10, z: 20 },
    { x: 30, z: 20 }
  ];

  rackPositions.forEach((pos, index) => {
    const rack = createServerRack(index);
    rack.position.set(pos.x, 0, pos.z);
    scene.add(rack);
    serverRacks.push(rack);
  });
};

// 创建单个服务器机架
const createServerRack = (id: number): THREE.Group => {
  const rackGroup = new THREE.Group();

  // 机架框架
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.3,
    metalness: 0.8
  });

  // 前后框架
  const frameDepth = 1;
  const frameWidth = 2;
  const frameHeight = 8;

  // 前框架
  const frontFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameWidth, frameHeight, 0.1),
    frameMaterial
  );
  frontFrame.position.z = frameDepth / 2;
  frontFrame.castShadow = true;
  rackGroup.add(frontFrame);

  // 后框架
  const backFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameWidth, frameHeight, 0.1),
    frameMaterial
  );
  backFrame.position.z = -frameDepth / 2;
  backFrame.castShadow = true;
  rackGroup.add(backFrame);

  // 侧框架
  const sideFrame1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, frameHeight, frameDepth),
    frameMaterial
  );
  sideFrame1.position.x = -frameWidth / 2;
  sideFrame1.castShadow = true;
  rackGroup.add(sideFrame1);

  const sideFrame2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, frameHeight, frameDepth),
    frameMaterial
  );
  sideFrame2.position.x = frameWidth / 2;
  sideFrame2.castShadow = true;
  rackGroup.add(sideFrame2);

  // 服务器单元
  const serverCount = 12;
  const serverHeight = frameHeight / serverCount;
  const serverSpacing = 0.05;

  for (let i = 0; i < serverCount; i++) {
    const serverY = -frameHeight / 2 + i * serverHeight + serverHeight / 2;
    const server = createServerUnit(id * 100 + i);
    server.position.y = serverY;
    server.position.z = 0;
    rackGroup.add(server);
  }

  // 顶部网络设备
  const networkDevice = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.3, 0.8),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.4,
      metalness: 0.6
    })
  );
  networkDevice.position.y = frameHeight / 2 + 0.15;
  networkDevice.castShadow = true;
  rackGroup.add(networkDevice);

  // 网络设备 LED
  const ledCount = 8;
  for (let i = 0; i < ledCount; i++) {
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 1
      })
    );
    led.position.set(
      -0.6 + (i * 1.2) / (ledCount - 1),
      frameHeight / 2 + 0.15,
      0.45
    );
    rackGroup.add(led);
  }

  // 冷却风扇
  const fanMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.5,
    metalness: 0.7
  });

  const fan1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16),
    fanMaterial
  );
  fan1.rotation.x = Math.PI / 2;
  fan1.position.set(-0.7, frameHeight / 2 - 0.5, 0);
  fan1.castShadow = true;
  rackGroup.add(fan1);

  const fan2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16),
    fanMaterial
  );
  fan2.rotation.x = Math.PI / 2;
  fan2.position.set(0.7, frameHeight / 2 - 0.5, 0);
  fan2.castShadow = true;
  rackGroup.add(fan2);

  return rackGroup;
};

// 创建服务器单元
const createServerUnit = (id: number): THREE.Group => {
  const serverGroup = new THREE.Group();

  // 服务器主体
  const serverMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.4,
    metalness: 0.5
  });

  const serverBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.5, 0.7),
    serverMaterial
  );
  serverBody.castShadow = true;
  serverBody.receiveShadow = true;
  serverGroup.add(serverBody);

  // LED 指示灯
  const ledColors = [0x00ff00, 0xff0000, 0xffff00, 0x0000ff];
  const ledColor = ledColors[Math.floor(Math.random() * ledColors.length)];
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshStandardMaterial({
      color: ledColor,
      emissive: ledColor,
      emissiveIntensity: 2
    })
  );
  led.position.set(0.8, 0, 0.36);
  serverGroup.add(led);

  // 存储 LED 引用以便动画
  (serverGroup as any).led = led;
  (serverGroup as any).ledColor = ledColor;

  // 添加细节（按钮、接口等）
  const button = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );
  button.rotation.x = Math.PI / 2;
  button.position.set(-0.7, 0, 0.36);
  serverGroup.add(button);

  return serverGroup;
};

// 创建巡视小人
const createPatrolCharacter = () => {
  patrolCharacter = new THREE.Group();

  // 身体
  const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a90e2,
    roughness: 0.7,
    metalness: 0.1
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 1;
  body.castShadow = true;
  patrolCharacter.add(body);

  // 头部
  const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xffdbac,
    roughness: 0.8
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 2;
  head.castShadow = true;
  patrolCharacter.add(head);

  // 手臂
  const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
  const armMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a90e2,
    roughness: 0.7
  });

  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.4, 1.2, 0);
  leftArm.rotation.z = Math.PI / 6;
  leftArm.castShadow = true;
  patrolCharacter.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.4, 1.2, 0);
  rightArm.rotation.z = -Math.PI / 6;
  rightArm.castShadow = true;
  patrolCharacter.add(rightArm);

  // 腿部
  const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x2c3e50,
    roughness: 0.8
  });

  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.15, 0.4, 0);
  leftLeg.castShadow = true;
  patrolCharacter.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.15, 0.4, 0);
  rightLeg.castShadow = true;
  patrolCharacter.add(rightLeg);

  // 手电筒（聚光灯）
  const flashlight = new THREE.SpotLight(0xffffff, 2, 15, Math.PI / 6, 0.3);
  flashlight.position.set(0, 1.8, 0.3);
  flashlight.target.position.set(0, 0, 5);
  flashlight.castShadow = true;
  flashlight.shadow.mapSize.width = 1024;
  flashlight.shadow.mapSize.height = 1024;
  patrolCharacter.add(flashlight);
  patrolCharacter.add(flashlight.target);

  // 设置初始位置
  patrolCharacter.position.set(-40, 0, 0);
  patrolCharacter.scale.set(0.8, 0.8, 0.8);
  scene.add(patrolCharacter);

  // 定义巡视路径
  patrolPath = [
    new THREE.Vector3(-40, 0, 0),
    new THREE.Vector3(-40, 0, -30),
    new THREE.Vector3(40, 0, -30),
    new THREE.Vector3(40, 0, 30),
    new THREE.Vector3(-40, 0, 30),
    new THREE.Vector3(-40, 0, 0)
  ];
};

// 创建性能监控面板（3D 文本）
const createPerformancePanels = () => {
  // 性能面板使用 HTML 覆盖层实现，这里只创建占位
  // 实际的性能数据在模板中显示
};

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate);

  // 更新控制器
  controls.update();

  // 更新巡视小人
  updatePatrolCharacter();

  // 更新服务器 LED 动画
  updateServerLEDs();

  // 更新性能数据
  updatePerformanceData();

  // 渲染场景
  renderer.render(scene, camera);
};

// 更新巡视小人
const updatePatrolCharacter = () => {
  if (!patrolCharacter || patrolPath.length === 0) return;

  const totalPathLength = patrolPath.length;
  const currentSegment = Math.floor(patrolProgress * totalPathLength) % totalPathLength;
  const nextSegment = (currentSegment + 1) % totalPathLength;
  const segmentProgress = (patrolProgress * totalPathLength) % 1;

  const currentPoint = patrolPath[currentSegment];
  const nextPoint = patrolPath[nextSegment];

  // 插值位置
  patrolCharacter.position.lerpVectors(currentPoint, nextPoint, segmentProgress);

  // 朝向移动方向
  const direction = new THREE.Vector3()
    .subVectors(nextPoint, currentPoint)
    .normalize();
  patrolCharacter.lookAt(
    patrolCharacter.position.x + direction.x,
    patrolCharacter.position.y,
    patrolCharacter.position.z + direction.z
  );

  // 更新进度
  patrolProgress += 0.0005;
  if (patrolProgress >= 1) {
    patrolProgress = 0;
  }

  // 更新手电筒方向
  const flashlight = patrolCharacter.children.find(
    child => child instanceof THREE.SpotLight
  ) as THREE.SpotLight;
  if (flashlight) {
    flashlight.target.position.copy(patrolCharacter.position);
    flashlight.target.position.add(direction.multiplyScalar(5));
  }
};

// 更新服务器 LED 动画
const updateServerLEDs = () => {
  serverRacks.forEach(rack => {
    rack.children.forEach(child => {
      if (child instanceof THREE.Group && (child as any).led) {
        const led = (child as any).led as THREE.Mesh;
        const time = Date.now() * 0.001;
        const intensity = 1 + Math.sin(time * 2 + Math.random() * 10) * 0.3;
        (led.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      }
    });
  });
};

// 更新性能数据
const updatePerformanceData = () => {
  const time = Date.now() * 0.001;
  performanceData.value.cpu = Math.floor(30 + Math.sin(time) * 20);
  performanceData.value.memory = Math.floor(50 + Math.cos(time * 0.7) * 15);
  performanceData.value.network = Math.floor(20 + Math.sin(time * 1.3) * 20);
  performanceData.value.temperature = Math.floor(35 + Math.sin(time * 0.5) * 10);
};

// 重置相机
const resetCamera = () => {
  camera.position.set(30, 25, 30);
  camera.lookAt(0, 0, 0);
  controls.reset();
};

// 处理窗口大小变化
const handleResize = () => {
  if (!containerRef.value) return;
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

onMounted(() => {
  initScene();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (renderer) {
    renderer.dispose();
  }
  if (containerRef.value && renderer?.domElement) {
    containerRef.value.removeChild(renderer.domElement);
  }
});
</script>

<style scoped lang="scss">
.datacenter-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
}

.threejs-container {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  color: #fff;

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: #00ff00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    margin-top: 20px;
    font-size: 18px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.performance-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  color: #fff;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 255, 0, 0.2);
  backdrop-filter: blur(10px);

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(0, 255, 0, 0.3);

    h3 {
      margin: 0;
      color: #00ff00;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .panel-content {
    .metric-item {
      margin-bottom: 20px;

      .metric-label {
        font-size: 14px;
        color: #aaa;
        margin-bottom: 5px;
      }

      .metric-value {
        font-size: 20px;
        color: #00ff00;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff00, #00cc00);
          border-radius: 4px;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }
      }
    }
  }
}

.control-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;

  .control-btn {
    padding: 10px 20px;
    background: rgba(20, 20, 20, 0.95);
    border: 1px solid rgba(0, 255, 0, 0.3);
    border-radius: 6px;
    color: #00ff00;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(0, 255, 0, 0.1);
      border-color: #00ff00;
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>

