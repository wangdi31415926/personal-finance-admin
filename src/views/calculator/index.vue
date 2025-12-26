<script setup lang="ts">
import { ref, computed } from "vue";

defineOptions({
  name: "Calculator"
});

// 显示的值
const display = ref("0");
// 当前输入的值
const currentValue = ref("0");
// 上一个值
const previousValue = ref<string | null>(null);
// 当前操作符
const operator = ref<string | null>(null);
// 是否等待新输入
const waitingForOperand = ref(false);

// 格式化显示
const formattedDisplay = computed(() => {
  const value = parseFloat(display.value);
  if (isNaN(value)) return "0";
  // 如果数字太大，使用科学计数法
  if (Math.abs(value) > 999999999) {
    return value.toExponential(5);
  }
  // 处理小数位数
  const str = value.toString();
  if (str.includes(".")) {
    const parts = str.split(".");
    return parts[0] + "." + parts[1].substring(0, 9);
  }
  return str;
});

// 输入数字
const inputNumber = (num: string) => {
  if (waitingForOperand.value) {
    display.value = num;
    waitingForOperand.value = false;
  } else {
    if (display.value === "0") {
      display.value = num;
    } else {
      // 限制输入长度
      if (display.value.length < 15) {
        display.value += num;
      }
    }
  }
  currentValue.value = display.value;
};

// 输入小数点
const inputDot = () => {
  if (waitingForOperand.value) {
    display.value = "0.";
    waitingForOperand.value = false;
  } else if (!display.value.includes(".")) {
    display.value += ".";
  }
  currentValue.value = display.value;
};

// 执行计算
const performCalculation = () => {
  if (previousValue.value === null || operator.value === null) return;

  const prev = parseFloat(previousValue.value);
  const current = parseFloat(currentValue.value);

  if (isNaN(prev) || isNaN(current)) return;

  let result: number;

  switch (operator.value) {
    case "+":
      result = prev + current;
      break;
    case "-":
      result = prev - current;
      break;
    case "×":
      result = prev * current;
      break;
    case "÷":
      if (current === 0) {
        display.value = "错误";
        reset();
        return;
      }
      result = prev / current;
      break;
    default:
      return;
  }

  // 处理精度问题
  result = Math.round(result * 100000000) / 100000000;
  display.value = result.toString();
  currentValue.value = display.value;
  previousValue.value = null;
  operator.value = null;
  waitingForOperand.value = true;
};

// 设置操作符
const setOperator = (op: string) => {
  if (operator.value && !waitingForOperand.value) {
    performCalculation();
  }

  previousValue.value = currentValue.value;
  operator.value = op;
  waitingForOperand.value = true;
};

// 清除
const clear = () => {
  display.value = "0";
  currentValue.value = "0";
  previousValue.value = null;
  operator.value = null;
  waitingForOperand.value = false;
};

// 重置
const reset = () => {
  clear();
};

// 删除最后一位
const backspace = () => {
  if (waitingForOperand.value) return;

  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1);
  } else {
    display.value = "0";
  }
  currentValue.value = display.value;
};

// 百分比
const percentage = () => {
  const value = parseFloat(display.value);
  if (!isNaN(value)) {
    display.value = (value / 100).toString();
    currentValue.value = display.value;
    waitingForOperand.value = true;
  }
};

// 正负号切换
const toggleSign = () => {
  if (waitingForOperand.value) return;

  const value = parseFloat(display.value);
  if (!isNaN(value) && value !== 0) {
    display.value = (-value).toString();
    currentValue.value = display.value;
  }
};

// 格式化数字，不使用科学计数法
const formatNumberWithoutScientific = (num: number): string => {
  if (!isFinite(num)) {
    return isNaN(num) ? "0" : "错误";
  }

  // 处理精度问题
  const rounded = Math.round(num * 100000000) / 100000000;

  // 如果数字为0，直接返回
  if (rounded === 0) {
    return "0";
  }

  // 检查是否为整数
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }

  // 转换为字符串检查是否包含科学计数法
  let str = rounded.toString();

  // 如果包含科学计数法，需要转换为普通格式
  if (str.includes("e") || str.includes("E")) {
    const absNum = Math.abs(rounded);

    // 解析科学计数法
    const match = str.match(/^(-?\d+\.?\d*)e([+-]\d+)$/i);
    if (match) {
      const base = parseFloat(match[1]);
      const exponent = parseInt(match[2]);

      if (exponent >= 0) {
        // 正指数，数字很大
        // 使用 toFixed 来避免科学计数法，保留足够的小数位
        const integerDigits = Math.floor(absNum).toString().length;
        const decimalPlaces = Math.max(0, 15 - integerDigits);
        str = rounded.toFixed(decimalPlaces);
      } else {
        // 负指数，数字很小
        // 计算需要的小数位数
        const decimalPlaces = Math.abs(exponent) + 10;
        str = rounded.toFixed(Math.min(decimalPlaces, 15));
      }
    } else {
      // 如果解析失败，使用固定小数位数
      str = rounded.toFixed(15);
    }
  }

  // 去除末尾的0和小数点
  if (str.includes(".")) {
    str = str.replace(/\.?0+$/, "");
  }

  return str;
};

// 两个输入框的值
const input1 = ref("");
const input2 = ref("");

// 计算两个输入框的和
const sum = computed(() => {
  const num1 = parseFloat(input1.value) || 0;
  const num2 = parseFloat(input2.value) || 0;
  const result = num1 + num2;
  // 处理精度问题
  const rounded = Math.round(result * 100000000) / 100000000;
  return rounded;
});

// 格式化显示的和（不使用科学计数法）
const formattedSum = computed(() => {
  return formatNumberWithoutScientific(sum.value);
});

// 计算两个输入框的乘积
const product = computed(() => {
  const num1 = parseFloat(input1.value) || 0;
  const num2 = parseFloat(input2.value) || 0;
  const result = num1 * num2;
  // 处理精度问题
  const rounded = Math.round(result * 100000000) / 100000000;
  return rounded;
});

// 格式化显示的乘积（不使用科学计数法）
const formattedProduct = computed(() => {
  return formatNumberWithoutScientific(product.value);
});

// 计算两个输入框的商
const quotient = computed(() => {
  const num1 = parseFloat(input1.value) || 0;
  const num2 = parseFloat(input2.value) || 0;
  if (num2 === 0) {
    return NaN; // 除零错误
  }
  const result = num1 / num2;
  // 处理精度问题
  const rounded = Math.round(result * 100000000) / 100000000;
  return rounded;
});

// 格式化显示的商（不使用科学计数法）
const formattedQuotient = computed(() => {
  if (isNaN(quotient.value)) {
    return "错误（除数不能为0）";
  }
  return formatNumberWithoutScientific(quotient.value);
});

// 计算两个输入框的次方（input1 的 input2 次方）
const power = computed(() => {
  const num1 = parseFloat(input1.value) || 0;
  const num2 = parseFloat(input2.value) || 0;
  // 如果底数为0且指数为负数，结果为无穷大
  if (num1 === 0 && num2 < 0) {
    return Infinity;
  }
  const result = Math.pow(num1, num2);
  // 处理精度问题
  const rounded = Math.round(result * 100000000) / 100000000;
  return rounded;
});

// 格式化显示的次方（不使用科学计数法）
const formattedPower = computed(() => {
  if (!isFinite(power.value)) {
    if (isNaN(power.value)) {
      return "错误";
    }
    if (power.value === Infinity) {
      return "无穷大";
    }
    if (power.value === -Infinity) {
      return "负无穷大";
    }
  }
  return formatNumberWithoutScientific(power.value);
});
</script>

<template>
  <div class="calculator-container">
    <div class="calculator-wrapper">
      <div class="calculator-header">
        <h2>简易计算器</h2>
      </div>

      <!-- 输入框区域 -->
      <div class="input-section">
        <div class="input-group">
          <label class="input-label">输入框1</label>
          <input
            v-model="input1"
            type="number"
            class="input-field"
            placeholder="请输入数字"
            step="any"
          />
        </div>
        <div class="input-group">
          <label class="input-label">输入框2</label>
          <input
            v-model="input2"
            type="number"
            class="input-field"
            placeholder="请输入数字"
            step="any"
          />
        </div>
        <div class="input-group">
          <label class="input-label">相加结果</label>
          <input
            :value="formattedSum"
            type="text"
            class="input-field input-result"
            placeholder="0"
            readonly
          />
        </div>
        <div class="input-group">
          <label class="input-label">相乘结果</label>
          <input
            :value="formattedProduct"
            type="text"
            class="input-field input-result"
            placeholder="0"
            readonly
          />
        </div>
        <div class="input-group">
          <label class="input-label">相除结果</label>
          <input
            :value="formattedQuotient"
            type="text"
            class="input-field input-result"
            placeholder="0"
            readonly
          />
        </div>
        <div class="input-group">
          <label class="input-label">次方结果（输入框1的输入框2次方）</label>
          <input
            :value="formattedPower"
            type="text"
            class="input-field input-result"
            placeholder="0"
            readonly
          />
        </div>
      </div>

      <!-- 显示屏 -->
      <div class="calculator-display">
        <div class="display-content">{{ formattedDisplay }}</div>
      </div>

      <!-- 按钮区域 -->
      <div class="calculator-buttons">
        <!-- 第一行 -->
        <button class="btn btn-function" @click="clear">C</button>
        <button class="btn btn-function" @click="backspace">⌫</button>
        <button class="btn btn-function" @click="percentage">%</button>
        <button class="btn btn-operator" @click="setOperator('÷')">÷</button>

        <!-- 第二行 -->
        <button class="btn btn-number" @click="inputNumber('7')">7</button>
        <button class="btn btn-number" @click="inputNumber('8')">8</button>
        <button class="btn btn-number" @click="inputNumber('9')">9</button>
        <button class="btn btn-operator" @click="setOperator('×')">×</button>

        <!-- 第三行 -->
        <button class="btn btn-number" @click="inputNumber('4')">4</button>
        <button class="btn btn-number" @click="inputNumber('5')">5</button>
        <button class="btn btn-number" @click="inputNumber('6')">6</button>
        <button class="btn btn-operator" @click="setOperator('-')">-</button>

        <!-- 第四行 -->
        <button class="btn btn-number" @click="inputNumber('1')">1</button>
        <button class="btn btn-number" @click="inputNumber('2')">2</button>
        <button class="btn btn-number" @click="inputNumber('3')">3</button>
        <button class="btn btn-operator" @click="setOperator('+')">+</button>

        <!-- 第五行 -->
        <button class="btn btn-number btn-zero" @click="toggleSign">±</button>
        <button class="btn btn-number" @click="inputNumber('0')">0</button>
        <button class="btn btn-number" @click="inputDot">.</button>
        <button class="btn btn-operator btn-equals" @click="performCalculation">
          =
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.calculator-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.calculator-wrapper {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 30px;
  max-width: 400px;
  width: 100%;
}

.calculator-header {
  text-align: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
  }
}

.input-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.input-group {
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
}

.input-result {
  background: #e8f4f8;
  border-color: #b3d9e6;
  color: #2c3e50;
  font-weight: 600;
  cursor: not-allowed;

  &:focus {
    border-color: #b3d9e6;
    box-shadow: none;
  }
}

.calculator-display {
  background: #1a1a1a;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.display-content {
  color: #ffffff;
  font-size: 36px;
  font-weight: 300;
  word-break: break-all;
  text-align: right;
  font-family: "Courier New", monospace;
}

.calculator-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.btn {
  border: none;
  border-radius: 10px;
  font-size: 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 20px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  &:active {
    transform: scale(0.95);
  }

  &:hover {
    opacity: 0.9;
  }
}

.btn-number {
  background: #f0f0f0;
  color: #333;

  &:hover {
    background: #e0e0e0;
  }
}

.btn-operator {
  background: #ff9500;
  color: #ffffff;

  &:hover {
    background: #ff8500;
  }
}

.btn-function {
  background: #d4d4d4;
  color: #333;

  &:hover {
    background: #c4c4c4;
  }
}

.btn-zero {
  grid-column: span 1;
}

.btn-equals {
  background: #ff9500;
  color: #ffffff;

  &:hover {
    background: #ff8500;
  }
}

@media (max-width: 480px) {
  .calculator-wrapper {
    padding: 20px;
  }

  .input-section {
    padding: 15px;
  }

  .input-label {
    font-size: 13px;
  }

  .input-field {
    font-size: 14px;
    padding: 10px 12px;
  }

  .display-content {
    font-size: 28px;
  }

  .btn {
    font-size: 20px;
    padding: 15px;
    min-height: 50px;
  }
}
</style>
