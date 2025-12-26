<template>
  <div class="datacenter-container">
    <div ref="containerRef" class="threejs-container" />
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner" />
      <p>加载中...</p>
    </div>
    <div v-if="showPanel" class="performance-panel">
      <div class="panel-header">
        <h3>性能监控</h3>
        <button class="close-btn" @click="showPanel = false">×</button>
      </div>
      <div class="panel-content">
        <div class="metric-item">
          <div class="metric-label">CPU 使用率</div>
          <div class="metric-value">{{ performanceData.cpu }}%</div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: performanceData.cpu + '%' }"
            />
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-label">内存使用率</div>
          <div class="metric-value">{{ performanceData.memory }}%</div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: performanceData.memory + '%' }"
            />
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-label">网络流量</div>
          <div class="metric-value">{{ performanceData.network }} MB/s</div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: (performanceData.network / 100) * 100 + '%' }"
            />
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-label">温度</div>
          <div class="metric-value">{{ performanceData.temperature }}°C</div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: (performanceData.temperature / 80) * 100 + '%' }"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="control-panel">
      <button class="control-btn" @click="showPanel = !showPanel">
        {{ showPanel ? "隐藏" : "显示" }}监控面板
      </button>
      <button class="control-btn" @click="resetCamera">重置视角</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { createServerUnit } from "./serverModel";

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
let labelRenderer: CSS2DRenderer;
let controls: OrbitControls;
let animationId: number;
let patrolCharacter: THREE.Group;
let patrolPath: THREE.Vector3[] = [];
let patrolProgress = 0;
let serverRacks: THREE.Group[] = [];
let dataParticles: THREE.Points[] = [];
let networkLines: THREE.Line[] = [];
let fanMeshes: THREE.Mesh[] = [];
let deviceLabels: CSS2DObject[] = [];

// 初始化场景
const initScene = () => {
  if (!containerRef.value) return;

  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.Fog(0x050505, 50, 300);

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
  renderer.toneMappingExposure = 2.0;
  containerRef.value.appendChild(renderer.domElement);

  // 创建CSS2D标签渲染器
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(width, height);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0";
  labelRenderer.domElement.style.pointerEvents = "none";
  containerRef.value.appendChild(labelRenderer.domElement);

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

  // 创建数据流动效果
  createDataParticles();

  // 创建网络连接线
  createNetworkLines();

  // 创建额外装饰元素
  createDecorativeElements();

  // 创建性能监控面板
  createPerformancePanels();

  // 为所有设备添加标签
  createDeviceLabels();

  // 开始动画循环
  animate();

  loading.value = false;
};

// 创建机房环境
const createEnvironment = () => {
  // 地面 - 基础材质
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x2a2a2a
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // 添加地面网格 - 更亮的颜色
  const gridHelper = new THREE.GridHelper(100, 50, 0x00ff88, 0x004422);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // 添加地面反射效果
  const floorReflection = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0.3
    })
  );
  floorReflection.rotation.x = -Math.PI / 2;
  floorReflection.position.y = 0.02;
  scene.add(floorReflection);

  // 墙面 - 基础材质
  const wallMaterial = new THREE.MeshBasicMaterial({
    color: 0x3a3a3a
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
    new THREE.MeshBasicMaterial({
      color: 0x1a1a1a
    })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 20;
  scene.add(ceiling);

  // 照明系统 - 增强光照
  // 环境光 - 增强亮度
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  // 主方向光 - 增强亮度和范围
  const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
  mainLight.position.set(20, 35, 20);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 4096;
  mainLight.shadow.mapSize.height = 4096;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 200;
  mainLight.shadow.camera.left = -60;
  mainLight.shadow.camera.right = 60;
  mainLight.shadow.camera.top = 60;
  mainLight.shadow.camera.bottom = -60;
  mainLight.shadow.bias = -0.0001;
  scene.add(mainLight);

  // 补充光源 - 增强
  const fillLight = new THREE.DirectionalLight(0x88ccff, 1.0);
  fillLight.position.set(-20, 20, -20);
  scene.add(fillLight);

  // 右侧补充光
  const rightLight = new THREE.DirectionalLight(0xffffff, 1.0);
  rightLight.position.set(30, 25, 0);
  scene.add(rightLight);

  // 顶部点光源（模拟天花板照明）- 增强亮度和数量
  for (let i = -40; i <= 40; i += 20) {
    for (let j = -40; j <= 40; j += 20) {
      const pointLight = new THREE.PointLight(0xffffff, 2.0, 50);
      pointLight.position.set(i, 18, j);
      pointLight.castShadow = true;
      pointLight.shadow.mapSize.width = 1024;
      pointLight.shadow.mapSize.height = 1024;
      scene.add(pointLight);

      // 添加可见的光源球体
      const lightSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshBasicMaterial({
          color: 0xffffff
        })
      );
      lightSphere.position.set(i, 18, j);
      scene.add(lightSphere);
    }
  }

  // 添加机架区域的聚光灯
  for (let i = -30; i <= 30; i += 20) {
    for (let j = -20; j <= 20; j += 40) {
      const spotLight = new THREE.SpotLight(
        0xffffff,
        3.0,
        30,
        Math.PI / 4,
        0.3
      );
      spotLight.position.set(i, 15, j);
      spotLight.target.position.set(i, 0, j);
      spotLight.castShadow = true;
      scene.add(spotLight);
      scene.add(spotLight.target);
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

  // 机架框架 - 基础材质
  const frameMaterial = new THREE.MeshBasicMaterial({
    color: 0x555555
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

  // 顶部网络设备（主机）- 蓝色方框
  const networkDevice = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.3, 0.8),
    new THREE.MeshBasicMaterial({
      color: 0x0000ff
    })
  );
  networkDevice.position.y = frameHeight / 2 + 0.15;
  networkDevice.castShadow = true;
  rackGroup.add(networkDevice);

  // 网络设备前面板
  const frontPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.28, 0.05),
    new THREE.MeshBasicMaterial({
      color: 0x1a1a1a
    })
  );
  frontPanel.position.set(0, frameHeight / 2 + 0.15, 0.4);
  rackGroup.add(frontPanel);

  // 网络设备 LED - 更多更亮
  const ledCount = 12;
  for (let i = 0; i < ledCount; i++) {
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 12, 12),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00ff00 : 0x0088ff
      })
    );
    led.position.set(
      -0.65 + (i * 1.3) / (ledCount - 1),
      frameHeight / 2 + 0.15,
      0.45
    );
    rackGroup.add(led);
  }

  // 添加网络端口
  for (let i = 0; i < 6; i++) {
    const port = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12),
      new THREE.MeshBasicMaterial({
        color: 0x000000
      })
    );
    port.rotation.x = Math.PI / 2;
    port.position.set(-0.5 + i * 0.2, frameHeight / 2 + 0.15, -0.35);
    rackGroup.add(port);
  }

  // 冷却风扇 - 基础材质
  const fanMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333
  });

  const fanFrameMaterial = new THREE.MeshBasicMaterial({
    color: 0x444444
  });

  // 风扇1
  const fanGroup1 = new THREE.Group();
  const fanFrame1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16),
    fanFrameMaterial
  );
  fanFrame1.rotation.x = Math.PI / 2;
  fanGroup1.add(fanFrame1);

  const fanBlades1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.02, 16),
    fanMaterial
  );
  fanBlades1.rotation.x = Math.PI / 2;
  fanGroup1.add(fanBlades1);

  // 添加风扇叶片
  for (let i = 0; i < 8; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.02, 0.05),
      fanMaterial
    );
    blade.rotation.z = (i * Math.PI * 2) / 8;
    blade.position.set(0, 0, 0.15);
    fanBlades1.add(blade);
  }

  fanGroup1.position.set(-0.7, frameHeight / 2 - 0.5, 0);
  fanGroup1.castShadow = true;
  rackGroup.add(fanGroup1);
  (fanGroup1 as any).fanBlades = fanBlades1;
  fanMeshes.push(fanBlades1);

  // 风扇2
  const fanGroup2 = new THREE.Group();
  const fanFrame2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16),
    fanFrameMaterial
  );
  fanFrame2.rotation.x = Math.PI / 2;
  fanGroup2.add(fanFrame2);

  const fanBlades2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.02, 16),
    fanMaterial
  );
  fanBlades2.rotation.x = Math.PI / 2;
  fanGroup2.add(fanBlades2);

  // 添加风扇叶片
  for (let i = 0; i < 8; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.02, 0.05),
      fanMaterial
    );
    blade.rotation.z = (i * Math.PI * 2) / 8;
    blade.position.set(0, 0, 0.15);
    fanBlades2.add(blade);
  }

  fanGroup2.position.set(0.7, frameHeight / 2 - 0.5, 0);
  fanGroup2.castShadow = true;
  rackGroup.add(fanGroup2);
  (fanGroup2 as any).fanBlades = fanBlades2;
  fanMeshes.push(fanBlades2);

  // 添加机架编号标识（发光）
  const rackLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.15),
    new THREE.MeshBasicMaterial({
      color: 0x00ff00
    })
  );
  rackLabel.position.set(0, frameHeight / 2 + 0.3, frameDepth / 2 + 0.05);
  rackGroup.add(rackLabel);

  return rackGroup;
};

// 服务器单元创建函数已移至 serverModel.ts

// 创建巡视小人
const createPatrolCharacter = () => {
  patrolCharacter = new THREE.Group();

  // 身体 - 基础材质
  const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
  const bodyMaterial = new THREE.MeshBasicMaterial({
    color: 0x5aa0f2
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 1;
  body.castShadow = true;
  patrolCharacter.add(body);

  // 头部
  const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
  const headMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdbac
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 2;
  head.castShadow = true;
  patrolCharacter.add(head);

  // 手臂
  const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
  const armMaterial = new THREE.MeshBasicMaterial({
    color: 0x4a90e2
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
  const legMaterial = new THREE.MeshBasicMaterial({
    color: 0x2c3e50
  });

  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.15, 0.4, 0);
  leftLeg.castShadow = true;
  patrolCharacter.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.15, 0.4, 0);
  rightLeg.castShadow = true;
  patrolCharacter.add(rightLeg);

  // 手电筒（聚光灯）- 增强亮度
  const flashlight = new THREE.SpotLight(0xffffff, 5, 20, Math.PI / 5, 0.4);
  flashlight.position.set(0, 1.8, 0.3);
  flashlight.target.position.set(0, 0, 5);
  flashlight.castShadow = true;
  flashlight.shadow.mapSize.width = 2048;
  flashlight.shadow.mapSize.height = 2048;
  flashlight.shadow.bias = -0.0001;
  patrolCharacter.add(flashlight);
  patrolCharacter.add(flashlight.target);

  // 添加手电筒可见模型
  const flashlightBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16),
    new THREE.MeshBasicMaterial({
      color: 0x333333
    })
  );
  flashlightBody.rotation.x = Math.PI / 2;
  flashlightBody.position.set(0, 1.8, 0.2);
  patrolCharacter.add(flashlightBody);

  // 手电筒发光前端
  const flashlightLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16),
    new THREE.MeshBasicMaterial({
      color: 0xffffff
    })
  );
  flashlightLens.rotation.x = Math.PI / 2;
  flashlightLens.position.set(0, 1.8, 0.31);
  patrolCharacter.add(flashlightLens);

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

// 创建设备标签
const createLabel = (text: string, position: THREE.Vector3): CSS2DObject => {
  const div = document.createElement("div");
  div.className = "device-label";
  div.textContent = text;
  div.style.color = "#00ff00";
  div.style.fontSize = "14px";
  div.style.fontWeight = "bold";
  div.style.textShadow = "0 0 5px #00ff00, 0 0 10px #00ff00";
  div.style.pointerEvents = "none";
  div.style.userSelect = "none";
  const label = new CSS2DObject(div);
  label.position.copy(position);
  return label;
};

// 为所有设备添加标签
const createDeviceLabels = () => {
  // 为每个服务器机架添加标签
  serverRacks.forEach((rack, index) => {
    // 机架标签
    const rackLabel = createLabel(
      `服务器机架-${index + 1}`,
      new THREE.Vector3(rack.position.x, rack.position.y + 5, rack.position.z)
    );
    scene.add(rackLabel);
    deviceLabels.push(rackLabel);

    // 为机架上的网络设备添加标签
    const networkDevice = rack.children.find(
      child =>
        child instanceof THREE.Mesh &&
        child.position.y > 3 &&
        (child.material as THREE.MeshBasicMaterial)?.color?.getHex() ===
          0x0000ff
    ) as THREE.Mesh;
    if (networkDevice) {
      const worldPos = new THREE.Vector3();
      networkDevice.getWorldPosition(worldPos);
      const deviceLabel = createLabel(
        `网络设备-${index + 1}`,
        new THREE.Vector3(worldPos.x, worldPos.y + 0.5, worldPos.z)
      );
      scene.add(deviceLabel);
      deviceLabels.push(deviceLabel);
    }
  });

  // 为中心交换机添加标签
  const centerSwitch = scene.children.find(
    child =>
      child instanceof THREE.Mesh &&
      child.position.x === 0 &&
      child.position.y === 6 &&
      child.position.z === 0
  ) as THREE.Mesh;
  if (centerSwitch) {
    const label = createLabel("中心交换机", new THREE.Vector3(0, 7.5, 0));
    scene.add(label);
    deviceLabels.push(label);
  }

  // 为冷却设备添加标签
  const coolingUnit = scene.children.find(
    child =>
      child instanceof THREE.Mesh &&
      child.position.x === 0 &&
      child.position.y === 1 &&
      child.position.z === -45
  ) as THREE.Mesh;
  if (coolingUnit) {
    const label = createLabel("冷却设备", new THREE.Vector3(0, 2.5, -45));
    scene.add(label);
    deviceLabels.push(label);
  }

  // 为UPS设备添加标签
  const upsUnit = scene.children.find(
    child =>
      child instanceof THREE.Mesh &&
      child.position.x === -45 &&
      child.position.y === 0.75 &&
      child.position.z === 0
  ) as THREE.Mesh;
  if (upsUnit) {
    const label = createLabel("UPS电源", new THREE.Vector3(-45, 2.5, 0));
    scene.add(label);
    deviceLabels.push(label);
  }

  // 为巡视小人添加标签
  if (patrolCharacter) {
    const label = createLabel(
      "巡视人员",
      new THREE.Vector3(
        patrolCharacter.position.x,
        patrolCharacter.position.y + 2.5,
        patrolCharacter.position.z
      )
    );
    patrolCharacter.add(label);
    deviceLabels.push(label);
  }
};

// 创建数据流动粒子效果
const createDataParticles = () => {
  serverRacks.forEach((rack, rackIndex) => {
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // 粒子位置在机架周围
      positions[i3] = (Math.random() - 0.5) * 3;
      positions[i3 + 1] = Math.random() * 8;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      // 随机颜色（绿色、蓝色、青色）
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i3] = 0;
        colors[i3 + 1] = 1;
        colors[i3 + 2] = 0;
      } else if (colorChoice < 0.66) {
        colors[i3] = 0;
        colors[i3 + 1] = 0.5;
        colors[i3 + 2] = 1;
      } else {
        colors[i3] = 0;
        colors[i3 + 1] = 1;
        colors[i3 + 2] = 1;
      }

      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    particles.position.copy(rack.position);
    scene.add(particles);
    dataParticles.push(particles);
    (particles as any).rackIndex = rackIndex;
    (particles as any).basePosition = rack.position.clone();
  });
};

// 创建装饰元素
const createDecorativeElements = () => {
  // 添加空调管道
  const pipeMaterial = new THREE.MeshBasicMaterial({
    color: 0x444444
  });

  // 天花板管道
  for (let i = -40; i <= 40; i += 20) {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 80, 16),
      pipeMaterial
    );
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(i, 19, 0);
    pipe.castShadow = true;
    scene.add(pipe);
  }

  // 添加冷却设备
  const coolingUnit = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 3),
    new THREE.MeshBasicMaterial({
      color: 0x333333
    })
  );
  coolingUnit.position.set(0, 1, -45);
  coolingUnit.castShadow = true;
  scene.add(coolingUnit);

  // 冷却设备LED
  for (let i = 0; i < 4; i++) {
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0x00ffff
      })
    );
    led.position.set(-1 + (i % 2) * 2, 1.5, -43.5 + Math.floor(i / 2) * 2);
    coolingUnit.add(led);
  }

  // 添加UPS电源设备
  const upsUnit = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.5, 1.5),
    new THREE.MeshBasicMaterial({
      color: 0x2a2a2a
    })
  );
  upsUnit.position.set(-45, 0.75, 0);
  upsUnit.castShadow = true;
  scene.add(upsUnit);

  // UPS状态显示
  const upsDisplay = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.3),
    new THREE.MeshBasicMaterial({
      color: 0x00ff00
    })
  );
  upsDisplay.position.set(-45, 1.2, 0.76);
  scene.add(upsDisplay);

  // 添加地面走线槽
  const cableTrayMaterial = new THREE.MeshBasicMaterial({
    color: 0x555555
  });

  for (let i = -30; i <= 30; i += 20) {
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(15, 0.2, 0.5),
      cableTrayMaterial
    );
    tray.position.set(i, 0.1, 0);
    scene.add(tray);
  }

  // 添加机房标识牌（发光）
  const signMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00
  });

  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.8), signMaterial);
  sign.position.set(0, 12, -49.5);
  scene.add(sign);
};

// 创建网络连接线
const createNetworkLines = () => {
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.6,
    linewidth: 2
  });

  // 在机架之间创建连接线
  for (let i = 0; i < serverRacks.length; i++) {
    for (let j = i + 1; j < serverRacks.length; j++) {
      if (Math.random() > 0.7) {
        // 70%的机架不连接，避免过于密集
        const rack1 = serverRacks[i];
        const rack2 = serverRacks[j];

        const points = [
          new THREE.Vector3(
            rack1.position.x,
            rack1.position.y + 4,
            rack1.position.z
          ),
          new THREE.Vector3(
            rack2.position.x,
            rack2.position.y + 4,
            rack2.position.z
          )
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
        networkLines.push(line);
      }
    }
  }

  // 创建中心交换机（主机）到各机架的连接
  const centerSwitch = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 2),
    new THREE.MeshBasicMaterial({
      color: 0x0000ff
    })
  );
  centerSwitch.position.set(0, 6, 0);
  centerSwitch.castShadow = true;
  scene.add(centerSwitch);

  // 添加交换机LED
  for (let i = 0; i < 16; i++) {
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00
      })
    );
    led.position.set(
      -0.7 + (i % 4) * 0.47,
      0.3,
      -0.7 + Math.floor(i / 4) * 0.47
    );
    centerSwitch.add(led);
  }

  // 从中心交换机连接到各机架
  serverRacks.forEach(rack => {
    const points = [
      new THREE.Vector3(0, 6, 0),
      new THREE.Vector3(rack.position.x, rack.position.y + 4, rack.position.z)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);
    networkLines.push(line);
  });
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

  // 更新风扇旋转
  updateFanRotation();

  // 更新数据粒子
  updateDataParticles();

  // 更新网络线动画
  updateNetworkLines();

  // 更新性能数据
  updatePerformanceData();

  // 更新巡视小人标签位置
  updatePatrolLabel();

  // 渲染场景
  renderer.render(scene, camera);

  // 渲染标签
  if (labelRenderer) {
    labelRenderer.render(scene, camera);
  }
};

// 更新巡视小人
const updatePatrolCharacter = () => {
  if (!patrolCharacter || patrolPath.length === 0) return;

  const totalPathLength = patrolPath.length;
  const currentSegment =
    Math.floor(patrolProgress * totalPathLength) % totalPathLength;
  const nextSegment = (currentSegment + 1) % totalPathLength;
  const segmentProgress = (patrolProgress * totalPathLength) % 1;

  const currentPoint = patrolPath[currentSegment];
  const nextPoint = patrolPath[nextSegment];

  // 插值位置
  patrolCharacter.position.lerpVectors(
    currentPoint,
    nextPoint,
    segmentProgress
  );

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
  if (flashlight && flashlight.target) {
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(patrolCharacter.quaternion);
    flashlight.target.position.copy(patrolCharacter.position);
    flashlight.target.position.add(forward.multiplyScalar(10));
    flashlight.target.position.y = 0;
  }

  // 添加行走动画
  const time = Date.now() * 0.001;
  const leftLeg = patrolCharacter.children.find(
    child =>
      child instanceof THREE.Mesh &&
      child.position.x < 0 &&
      child.position.y < 1
  ) as THREE.Mesh;
  const rightLeg = patrolCharacter.children.find(
    child =>
      child instanceof THREE.Mesh &&
      child.position.x > 0 &&
      child.position.y < 1
  ) as THREE.Mesh;

  if (leftLeg && rightLeg) {
    leftLeg.rotation.x = Math.sin(time * 4) * 0.3;
    rightLeg.rotation.x = -Math.sin(time * 4) * 0.3;
  }

  // 手臂摆动
  const leftArm = patrolCharacter.children.find(
    child =>
      child instanceof THREE.Mesh &&
      child.position.x < 0 &&
      child.position.y > 1 &&
      child.position.y < 2
  ) as THREE.Mesh;
  const rightArm = patrolCharacter.children.find(
    child =>
      child instanceof THREE.Mesh &&
      child.position.x > 0 &&
      child.position.y > 1 &&
      child.position.y < 2
  ) as THREE.Mesh;

  if (leftArm && rightArm) {
    leftArm.rotation.z = Math.PI / 6 + Math.sin(time * 4) * 0.2;
    rightArm.rotation.z = -Math.PI / 6 - Math.sin(time * 4) * 0.2;
  }
};

// 更新服务器 LED 动画
const updateServerLEDs = () => {
  const time = Date.now() * 0.001;
  serverRacks.forEach(rack => {
    rack.children.forEach(child => {
      if (child instanceof THREE.Group && (child as any).led) {
        const serverGroup = child as THREE.Group;
        // 主状态LED - 持续闪烁
        const statusLed = (serverGroup as any).led as THREE.Mesh;
        if (statusLed) {
          const intensity = 0.6 + Math.sin(time * 3) * 0.4;
          const material = statusLed.material as THREE.MeshBasicMaterial;
          if (material) {
            material.opacity = intensity;
            material.transparent = true;
          }
        }

        // 网络LED - 快速闪烁
        const networkLed = (serverGroup as any).networkLed as THREE.Mesh;
        if (networkLed) {
          const intensity = 0.5 + Math.sin(time * 5) * 0.5;
          const material = networkLed.material as THREE.MeshBasicMaterial;
          if (material) {
            material.opacity = intensity;
            material.transparent = true;
          }
        }

        // 警告LED - 慢速闪烁
        const warningLed = (serverGroup as any).warningLed as THREE.Mesh;
        if (warningLed) {
          const intensity = 0.4 + Math.sin(time * 1.5) * 0.4;
          const material = warningLed.material as THREE.MeshBasicMaterial;
          if (material) {
            material.opacity = intensity;
            material.transparent = true;
          }
        }
      }
    });
  });
};

// 更新风扇旋转
const updateFanRotation = () => {
  const time = Date.now() * 0.001;
  fanMeshes.forEach((fan, index) => {
    if (fan) {
      fan.rotation.z += 0.1;
      // 添加轻微的摆动效果
      const parent = fan.parent;
      if (parent) {
        parent.rotation.y = Math.sin(time * 2 + index) * 0.05;
      }
    }
  });
};

// 更新数据粒子
const updateDataParticles = () => {
  const time = Date.now() * 0.001;
  dataParticles.forEach((particles, index) => {
    if (particles && particles.geometry) {
      const positions = particles.geometry.attributes.position
        .array as Float32Array;
      const basePos = (particles as any).basePosition;

      for (let i = 0; i < positions.length; i += 3) {
        // 粒子向上流动
        positions[i + 1] += 0.02;
        if (positions[i + 1] > 8) {
          positions[i + 1] = 0;
        }

        // 添加轻微的左右摆动
        positions[i] += Math.sin(time + i) * 0.01;
        positions[i + 2] += Math.cos(time + i) * 0.01;
      }

      particles.geometry.attributes.position.needsUpdate = true;
    }
  });
};

// 更新网络线动画
const updateNetworkLines = () => {
  const time = Date.now() * 0.001;
  networkLines.forEach((line, index) => {
    if (line && line.material) {
      const material = line.material as THREE.LineBasicMaterial;
      // 脉冲效果
      material.opacity = 0.4 + Math.sin(time * 2 + index) * 0.3;
    }
  });
};

// 更新性能数据
const updatePerformanceData = () => {
  const time = Date.now() * 0.001;
  performanceData.value.cpu = Math.floor(30 + Math.sin(time) * 20);
  performanceData.value.memory = Math.floor(50 + Math.cos(time * 0.7) * 15);
  performanceData.value.network = Math.floor(20 + Math.sin(time * 1.3) * 20);
  performanceData.value.temperature = Math.floor(
    35 + Math.sin(time * 0.5) * 10
  );
};

// 更新巡视小人标签位置
const updatePatrolLabel = () => {
  if (patrolCharacter) {
    const label = patrolCharacter.children.find(
      child => child instanceof CSS2DObject
    ) as CSS2DObject;
    if (label) {
      label.position.set(0, 2.5, 0);
    }
  }
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
  if (labelRenderer) {
    labelRenderer.setSize(width, height);
  }
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
  if (labelRenderer && containerRef.value && labelRenderer.domElement) {
    containerRef.value.removeChild(labelRenderer.domElement);
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
