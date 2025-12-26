import * as THREE from "three";

/**
 * 服务器模型配置接口
 */
export interface ServerConfig {
  id: number;
  width?: number;
  height?: number;
  depth?: number;
  color?: number;
}

/**
 * 服务器模型类 - 三角洲游戏风格
 * 详细设计的服务器外观，包含所有细节
 */
export class ServerModel {
  private group: THREE.Group;
  private config: Required<ServerConfig>;
  private materials: {
    body: THREE.MeshBasicMaterial;
    frame: THREE.MeshBasicMaterial;
    frontPanel: THREE.MeshBasicMaterial;
    vent: THREE.MeshBasicMaterial;
    handle: THREE.MeshBasicMaterial;
    ledPanel: THREE.MeshBasicMaterial;
  };

  // LED 引用
  public statusLed?: THREE.Mesh;
  public networkLed?: THREE.Mesh;
  public warningLed?: THREE.Mesh;

  constructor(config: ServerConfig) {
    this.config = {
      id: config.id,
      width: config.width ?? 1.8,
      height: config.height ?? 0.5,
      depth: config.depth ?? 0.7,
      color: config.color ?? 0x0a0a0a
    };

    this.group = new THREE.Group();
    this.initMaterials();
    this.buildServer();
  }

  /**
   * 初始化材质
   */
  private initMaterials(): void {
    this.materials = {
      body: new THREE.MeshBasicMaterial({
        color: this.config.color
      }),
      frame: new THREE.MeshBasicMaterial({
        color: 0x333333 // 金属边框
      }),
      frontPanel: new THREE.MeshBasicMaterial({
        color: 0x1a1a1a // 前面板深色
      }),
      vent: new THREE.MeshBasicMaterial({
        color: 0x0d0d0d // 散热孔
      }),
      handle: new THREE.MeshBasicMaterial({
        color: 0x2a2a2a // 把手
      }),
      ledPanel: new THREE.MeshBasicMaterial({
        color: 0x000000 // LED面板
      })
    };
  }

  /**
   * 构建服务器主体
   */
  private buildServer(): void {
    // 1. 服务器主体
    this.createBody();

    // 2. 金属边框装饰
    this.createFrames();

    // 3. 前面板
    this.createFrontPanel();

    // 4. 网格散热孔
    this.createVents();

    // 5. LED 指示灯系统
    this.createLEDs();

    // 6. 电源按钮
    this.createPowerButton();

    // 7. 接口区域
    this.createInterfaces();

    // 8. 型号标识
    this.createModelLabel();

    // 9. 侧边把手
    this.createHandles();

    // 10. 细节装饰
    this.createDetails();
  }

  /**
   * 创建服务器主体
   */
  private createBody(): void {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(
        this.config.width,
        this.config.height,
        this.config.depth
      ),
      this.materials.body
    );
    body.castShadow = true;
    body.receiveShadow = true;
    this.group.add(body);
  }

  /**
   * 创建金属边框装饰
   */
  private createFrames(): void {
    const frameThickness = 0.02;
    const frameOffset = 0.01;

    // 顶部边框
    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(
        this.config.width + frameOffset * 2,
        frameThickness,
        this.config.depth + frameOffset * 2
      ),
      this.materials.frame
    );
    topFrame.position.set(0, this.config.height / 2, 0);
    this.group.add(topFrame);

    // 底部边框
    const bottomFrame = new THREE.Mesh(
      new THREE.BoxGeometry(
        this.config.width + frameOffset * 2,
        frameThickness,
        this.config.depth + frameOffset * 2
      ),
      this.materials.frame
    );
    bottomFrame.position.set(0, -this.config.height / 2, 0);
    this.group.add(bottomFrame);

    // 左侧边框
    const leftFrame = new THREE.Mesh(
      new THREE.BoxGeometry(
        frameThickness,
        this.config.height,
        this.config.depth + frameOffset * 2
      ),
      this.materials.frame
    );
    leftFrame.position.set(-this.config.width / 2, 0, 0);
    this.group.add(leftFrame);

    // 右侧边框
    const rightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(
        frameThickness,
        this.config.height,
        this.config.depth + frameOffset * 2
      ),
      this.materials.frame
    );
    rightFrame.position.set(this.config.width / 2, 0, 0);
    this.group.add(rightFrame);
  }

  /**
   * 创建前面板
   */
  private createFrontPanel(): void {
    const panelDepth = 0.05;
    const panelHeight = this.config.height * 0.96;

    const frontPanel = new THREE.Mesh(
      new THREE.BoxGeometry(this.config.width, panelHeight, panelDepth),
      this.materials.frontPanel
    );
    frontPanel.position.z = this.config.depth / 2 + panelDepth / 2;
    this.group.add(frontPanel);
  }

  /**
   * 创建网格散热孔
   */
  private createVents(): void {
    const ventRows = 3;
    const ventCols = 8;
    const ventWidth = 0.18;
    const ventHeight = 0.12;
    const ventSpacingX = 0.18;
    const ventSpacingY = 0.12;
    const startX = -0.63;
    const startY = -0.12;
    const ventZ = this.config.depth / 2 + 0.36;

    for (let row = 0; row < ventRows; row++) {
      for (let col = 0; col < ventCols; col++) {
        // 散热孔
        const ventHole = new THREE.Mesh(
          new THREE.BoxGeometry(ventWidth, ventHeight, 0.02),
          this.materials.vent
        );
        ventHole.position.set(
          startX + col * ventSpacingX,
          startY + row * ventSpacingY,
          ventZ
        );
        this.group.add(ventHole);

        // 网格线条
        const gridLine = new THREE.Mesh(
          new THREE.BoxGeometry(ventWidth, 0.01, 0.03),
          this.materials.frame
        );
        gridLine.position.set(
          startX + col * ventSpacingX,
          startY + row * ventSpacingY,
          ventZ + 0.01
        );
        this.group.add(gridLine);
      }
    }
  }

  /**
   * 创建LED指示灯系统
   */
  private createLEDs(): void {
    const ledPanelWidth = 0.3;
    const ledPanelHeight = 0.15;
    const ledZ = this.config.depth / 2 + 0.36;

    // LED面板
    const ledPanel = new THREE.Mesh(
      new THREE.BoxGeometry(ledPanelWidth, ledPanelHeight, 0.02),
      this.materials.ledPanel
    );
    ledPanel.position.set(0.65, 0.15, ledZ);
    this.group.add(ledPanel);

    // 主状态LED（绿色 - 运行中）
    this.statusLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 1
      })
    );
    this.statusLed.position.set(0.65, 0.15, ledZ + 0.01);
    this.group.add(this.statusLed);

    // 网络状态LED（蓝色）
    this.networkLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 10, 10),
      new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 1
      })
    );
    this.networkLed.position.set(0.75, 0.15, ledZ + 0.01);
    this.group.add(this.networkLed);

    // 警告LED（黄色）
    this.warningLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 10, 10),
      new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 1
      })
    );
    this.warningLed.position.set(0.55, 0.15, ledZ + 0.01);
    this.group.add(this.warningLed);

    // 存储引用到group以便外部访问
    (this.group as any).led = this.statusLed;
    (this.group as any).ledColor = 0x00ff00;
    (this.group as any).networkLed = this.networkLed;
    (this.group as any).warningLed = this.warningLed;
  }

  /**
   * 创建电源按钮
   */
  private createPowerButton(): void {
    const buttonZ = this.config.depth / 2 + 0.36;
    const buttonRadius = 0.05;
    const buttonHeight = 0.02;

    // 电源按钮主体
    const powerButton = new THREE.Mesh(
      new THREE.CylinderGeometry(buttonRadius, buttonRadius, buttonHeight, 16),
      new THREE.MeshBasicMaterial({
        color: 0x444444
      })
    );
    powerButton.rotation.x = Math.PI / 2;
    powerButton.position.set(-0.75, 0.15, buttonZ);
    this.group.add(powerButton);

    // 按钮中心指示
    const buttonCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.01, 12),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00
      })
    );
    buttonCenter.rotation.x = Math.PI / 2;
    buttonCenter.position.set(-0.75, 0.15, buttonZ + 0.01);
    this.group.add(buttonCenter);

    // 按钮外圈装饰
    const buttonRing = new THREE.Mesh(
      new THREE.TorusGeometry(buttonRadius, 0.005, 8, 16),
      new THREE.MeshBasicMaterial({
        color: 0x555555
      })
    );
    buttonRing.rotation.x = Math.PI / 2;
    buttonRing.position.set(-0.75, 0.15, buttonZ + 0.01);
    this.group.add(buttonRing);
  }

  /**
   * 创建接口区域
   */
  private createInterfaces(): void {
    const interfaceZ = this.config.depth / 2 + 0.36;
    const interfaceWidth = 0.25;
    const interfaceHeight = 0.1;

    // 接口面板
    const interfacePanel = new THREE.Mesh(
      new THREE.BoxGeometry(interfaceWidth, interfaceHeight, 0.02),
      new THREE.MeshBasicMaterial({
        color: 0x0a0a0a
      })
    );
    interfacePanel.position.set(-0.75, -0.15, interfaceZ);
    this.group.add(interfacePanel);

    // USB接口
    for (let i = 0; i < 2; i++) {
      const usbPort = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.03, 0.01),
        new THREE.MeshBasicMaterial({
          color: 0x000000
        })
      );
      usbPort.position.set(-0.75 + i * 0.1, -0.15, interfaceZ + 0.01);
      this.group.add(usbPort);

      // USB接口内部
      const usbInner = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.01, 0.005),
        new THREE.MeshBasicMaterial({
          color: 0x222222
        })
      );
      usbInner.position.set(-0.75 + i * 0.1, -0.15, interfaceZ + 0.015);
      this.group.add(usbInner);
    }

    // 网络接口（RJ45）
    const networkPort = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.04, 0.01),
      new THREE.MeshBasicMaterial({
        color: 0x000000
      })
    );
    networkPort.position.set(0.75, -0.15, interfaceZ + 0.01);
    this.group.add(networkPort);

    // 网络接口内部
    const networkInner = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.02, 0.005),
      new THREE.MeshBasicMaterial({
        color: 0x1a1a1a
      })
    );
    networkInner.position.set(0.75, -0.15, interfaceZ + 0.015);
    this.group.add(networkInner);
  }

  /**
   * 创建型号标识
   */
  private createModelLabel(): void {
    const labelZ = this.config.depth / 2 + 0.36;
    const labelWidth = 0.35;
    const labelHeight = 0.08;

    // 标识背景
    const modelLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(labelWidth, labelHeight),
      new THREE.MeshBasicMaterial({
        color: 0x1a1a1a
      })
    );
    modelLabel.rotation.x = -Math.PI / 2;
    modelLabel.position.set(0, this.config.height / 2 - 0.01, labelZ);
    this.group.add(modelLabel);

    // 标识边框
    const labelFrame = new THREE.Mesh(
      new THREE.BoxGeometry(labelWidth + 0.02, labelHeight + 0.02, 0.01),
      this.materials.frame
    );
    labelFrame.position.set(0, this.config.height / 2 - 0.01, labelZ - 0.005);
    this.group.add(labelFrame);

    // 型号文字区域（模拟）
    const modelText = new THREE.Mesh(
      new THREE.PlaneGeometry(labelWidth - 0.04, labelHeight - 0.02),
      new THREE.MeshBasicMaterial({
        color: 0x0a0a0a
      })
    );
    modelText.rotation.x = -Math.PI / 2;
    modelText.position.set(0, this.config.height / 2 - 0.01, labelZ + 0.001);
    this.group.add(modelText);
  }

  /**
   * 创建侧边把手
   */
  private createHandles(): void {
    const handleWidth = 0.08;
    const handleHeight = 0.3;
    const handleDepth = 0.05;
    const handleY = 0;
    const handleZ = -this.config.depth / 2 + 0.3;

    // 左侧把手
    const leftHandle = new THREE.Mesh(
      new THREE.BoxGeometry(handleWidth, handleHeight, handleDepth),
      this.materials.handle
    );
    leftHandle.position.set(-this.config.width / 2 - 0.04, handleY, handleZ);
    this.group.add(leftHandle);

    // 左侧把手装饰
    const leftHandleDetail = new THREE.Mesh(
      new THREE.BoxGeometry(handleWidth - 0.02, handleHeight - 0.1, 0.01),
      new THREE.MeshBasicMaterial({
        color: 0x1a1a1a
      })
    );
    leftHandleDetail.position.set(
      -this.config.width / 2 - 0.04,
      handleY,
      handleZ + 0.03
    );
    this.group.add(leftHandleDetail);

    // 右侧把手
    const rightHandle = new THREE.Mesh(
      new THREE.BoxGeometry(handleWidth, handleHeight, handleDepth),
      this.materials.handle
    );
    rightHandle.position.set(this.config.width / 2 + 0.04, handleY, handleZ);
    this.group.add(rightHandle);

    // 右侧把手装饰
    const rightHandleDetail = new THREE.Mesh(
      new THREE.BoxGeometry(handleWidth - 0.02, handleHeight - 0.1, 0.01),
      new THREE.MeshBasicMaterial({
        color: 0x1a1a1a
      })
    );
    rightHandleDetail.position.set(
      this.config.width / 2 + 0.04,
      handleY,
      handleZ + 0.03
    );
    this.group.add(rightHandleDetail);
  }

  /**
   * 创建细节装饰
   */
  private createDetails(): void {
    const detailZ = this.config.depth / 2 + 0.36;

    // 前面板装饰线条
    for (let i = 0; i < 2; i++) {
      const detailLine = new THREE.Mesh(
        new THREE.BoxGeometry(this.config.width * 0.8, 0.005, 0.01),
        this.materials.frame
      );
      detailLine.position.set(0, -0.2 + i * 0.1, detailZ);
      this.group.add(detailLine);
    }

    // 侧边装饰螺丝
    const screwMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444
    });

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const screw = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 0.01, 8),
          screwMaterial
        );
        screw.rotation.x = Math.PI / 2;
        screw.position.set(
          (-this.config.width / 2 + 0.1) * (i === 0 ? -1 : 1),
          -this.config.height / 2 + 0.15 + j * (this.config.height - 0.3),
          this.config.depth / 2 - 0.05
        );
        this.group.add(screw);
      }
    }
  }

  /**
   * 获取服务器组对象
   */
  public getGroup(): THREE.Group {
    return this.group;
  }

  /**
   * 更新LED动画
   */
  public updateLEDs(time: number): void {
    if (this.statusLed) {
      const material = this.statusLed.material as THREE.MeshBasicMaterial;
      material.opacity = 0.6 + Math.sin(time * 3) * 0.4;
    }

    if (this.networkLed) {
      const material = this.networkLed.material as THREE.MeshBasicMaterial;
      material.opacity = 0.5 + Math.sin(time * 5) * 0.5;
    }

    if (this.warningLed) {
      const material = this.warningLed.material as THREE.MeshBasicMaterial;
      material.opacity = 0.4 + Math.sin(time * 1.5) * 0.4;
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    Object.values(this.materials).forEach(material => {
      material.dispose();
    });
    this.group.clear();
  }
}

/**
 * 创建服务器单元（便捷函数）
 */
export function createServerUnit(id: number): THREE.Group {
  const server = new ServerModel({ id });
  return server.getGroup();
}
