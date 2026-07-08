---
layout: post
title: 梯度下降法
date: 2026-04-21
---
# 梯度下降法<span class="animated-dot"></span>
## **为什么我们要沿着“负梯度”的方向去更新参数？**

## 第一步：定义多元函数的近似公式

$$\Delta z = f(x+\Delta x, y+\Delta y) - f(x,y)$$


这是自变量 $x$ 和 $y$ 分别改变了 $\Delta x$ 和 $\Delta y$ 时，函数值 $z$ 的**真实变化量**。

在实际计算中，直接算出这个真实的 $\Delta z$ 往往非常困难。因此引入一阶泰勒展开（全微分）来**近似**它，这就是公式 (1)：


$$\Delta z \approx \frac{\partial f(x,y)}{\partial x} \Delta x + \frac{\partial f(x,y)}{\partial y} \Delta y$$

> **直观理解**：总的变化量 $\approx$ （$x$ 方向的斜率 $\times$ $x$ 的改变量） $+$ （$y$ 方向的斜率 $\times$ $y$ 的改变量）。

## 第二步：转变成向量内积形式

把公式 (1)加法拆解成两个向量的内积的形式

$$\Delta z \approx \begin{pmatrix} \frac{\partial f(x,y)}{\partial x} \\ \frac{\partial f(x,y)}{\partial y} \end{pmatrix} \cdot \begin{pmatrix} \Delta x \\ \Delta y \end{pmatrix}$$

这里诞生了两个在机器学习中举足轻重的向量：

1. **梯度向量 $\mathbf{g}$**：$\left( \frac{\partial f}{\partial x}, \frac{\partial f}{\partial y} \right)$。它完全由函数此时此刻的偏导数决定。**只要是在曲面的某一个固定点，这个梯度向量就是固定不动的。**
2. **位移向量 $\mathbf{d}$**：$(\Delta x, \Delta y)$。这是接下来准备迈出的一小步，**它的方向和长短完全自由决定**。

所以，函数值的变化量可以被精简地写为：


$$\Delta z \approx \mathbf{g} \cdot \mathbf{d}$$


## 第三步：向量内积的几何意义

为了搞清楚“怎么迈步才能让函数值下降最快”，引入“向量内积的回顾”。

两个向量 $\mathbf{a}$ 和 $\mathbf{b}$ 的内积公式为：


$$\mathbf{a} \cdot \mathbf{b} = \|\mathbf{a}\| \|\mathbf{b}\| \cos\theta$$


其中 $\|\mathbf{a}\|$ 和 $\|\mathbf{b}\|$ 是向量的长度（永远是正数），$\theta$ 是它们之间的夹角。因为长度固定，内积的大小和正负全看 $\cos\theta$ 的脸色：

* 当 $\theta = 0^\circ$ 时，$\cos\theta = 1$（方向完全相同），内积取得**最大正值**。
* 当 $\theta = 90^\circ$ 时，$\cos\theta = 0$（方向垂直），内积为 $0$。
* 当 $\theta = 180^\circ$ 时，$\cos\theta = -1$（方向完全相反），内积取得**最大负值**。


## 第四步：负梯度方向下降最快

> “因向量积为 $\Delta z$，故 $(\Delta x, \Delta y) = -\lambda \left(\frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}\right)$ 时 $\Delta z$ 最小。”

我们要让函数值**下降得最快**，潜台词就是让变化量 $\Delta z$ 变成**最大的负数**（即越负越好，亏损最大）。

根据第三步的内积结论：

1. 我们希望 $\Delta z \approx \mathbf{g} \cdot \mathbf{d}$ 取得最大负值。
2. 那么梯度向量 $\mathbf{g}$ 与你的迈步向量 $\mathbf{d}$ 之间的夹角 $\theta$ **必须是 $180^\circ$**。
3. 这意味着：**迈步方向 $\mathbf{d}$ 必须和梯度向量 $\mathbf{g}$ 完全相反**

用数学语言表达就是：
$$\mathbf{d} = -k \cdot \mathbf{g} \quad (k > 0)$$
展开成坐标形式，就是：
$$(\Delta x, \Delta y) = -\lambda \left( \frac{\partial f}{\partial x}, \frac{\partial f}{\partial y} \right)$$


这里的 $\lambda$（或 $k$）是一个正数，也就是我们在训练神经网络时天天调的**学习率（Learning Rate）**。

---

## **梯度下降实例**
梯度下降就是根据损失函数对网络中神经单元的可训练的权重参数求导，改变这些自变量的值，让损失函数值减小，误差减小。神经网络看似神秘，其底层逻辑就是把“降低误差”这个问题，转换成了“通过求导改变自变量，从而寻找多元函数最小值”的数学问题。为了直观，我们用一个最简单的**三层神经网络**（2个输入、1个隐藏层神经元、1个输出层神经元）和一组实际的数据来一步步推导。

## 网络结构与初始参数

### 1. 基础设置

* **输入数据**：$x_1 = 2.0, x_2 = 3.0$
* **真实标签（目标值）**：$y_{true} = 1.0$
* **激活函数**：Sigmoid 函数，公式为：

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$



*其导数有一个很好的性质：$\sigma'(z) = \sigma(z)(1 - \sigma(z))$*
* **损失函数**：均方误差（MSE），公式为：

$$L = \frac{1}{2}(y_{true} - y_{pred})^2$$


* **学习率（Learning Rate）**：$\eta = 0.1$

### 2. 权重和偏置初始值

| 层级 | 参数 | 初始值 |
| --- | --- | --- |
| **输入层 $\rightarrow$ 隐藏层** | 权重 $w_1, w_2$ <br> 偏置 $b_1$ | $w_1 = 0.5, w_2 = -0.4$<br>$b_1 = 0.1$ |
| **隐藏层 $\rightarrow$ 输出层** | 权重 $w_3$<br>偏置 $b_2$ | $w_3 = 0.7$<br>$b_2 = -0.2$ |


## 第一阶段：正向传播（Forward Propagation）

正向传播的目标是计算出网络的预测值 $y_{pred}$。

### 1. 计算隐藏层神经元的输出 $h_1$

首先计算未激活的输入总和 $z_1$：


$$z_1 = x_1 \cdot w_1 + x_2 \cdot w_2 + b_1$$

$$z_1 = 2.0 \cdot 0.5 + 3.0 \cdot (-0.4) + 0.1 = 1.0 - 1.2 + 0.1 = -0.1$$

带入 Sigmoid 激活函数：


$$h_1 = \sigma(-0.1) = \frac{1}{1 + e^{-(-0.1)}} \approx 0.475$$

### 2. 计算输出层神经元的输出 $y_{pred}$

同样，先计算未激活的输入总和 $z_2$：


$$z_2 = h_1 \cdot w_3 + b_2$$

$$z_2 = 0.475 \cdot 0.7 + (-0.2) = 0.3325 - 0.2 = 0.1325$$

带入 Sigmoid 激活函数：


$$y_{pred} = \sigma(0.1325) = \frac{1}{1 + e^{-0.1325}} \approx 0.533$$


## 第二阶段：计算损失（Loss）

有了预测值 $y_{pred} = 0.533$，我们可以算出当前的损失值：


$$L = \frac{1}{2}(1.0 - 0.533)^2 = \frac{1}{2}(0.467)^2 \approx 0.109$$

现在的目标就是通过**反向传播**，看看各个权重对这 $0.109$ 的损失贡献了多少（计算梯度），然后把它降下来。


## 第三阶段：反向传播（Backpropagation）

我们要从后往前，利用**链式法则**计算各个参数的偏导数。

### 1. 输出层到隐藏层的梯度（计算 $\frac{\partial L}{\partial w_3}$ 和 $\frac{\partial L}{\partial b_2}$）

根据链式法则，损失 $L$ 对 $w_3$ 的改变有多敏感，取决于：

1. 预测值 $y_{pred}$ 变动对 $L$ 的影响
2. $z_2$ 变动对 $y_{pred}$ 的影响
3. $w_3$ 变动对 $z_2$ 的影响

$$\frac{\partial L}{\partial w_3} = \frac{\partial L}{\partial y_{pred}} \cdot \frac{\partial y_{pred}}{\partial z_2} \cdot \frac{\partial z_2}{\partial w_3}$$

我们分步计算这三部分：

* **第一部分**：$\frac{\partial L}{\partial y_{pred}} = -(y_{true} - y_{pred}) = -(1.0 - 0.533) = -0.467$
* **第二部分**（Sigmoid求导）：$\frac{\partial y_{pred}}{\partial z_2} = y_{pred}(1 - y_{pred}) = 0.533 \cdot (1 - 0.533) \approx 0.249$
* **第三部分**：因为 $z_2 = h_1 \cdot w_3 + b_2$，所以 $\frac{\partial z_2}{\partial w_3} = h_1 = 0.475$

我们将前两部分的乘积定义为输出层的误差项 $\delta_2$：


$$\delta_2 = \frac{\partial L}{\partial z_2} = -0.467 \cdot 0.249 \approx -0.116$$

最终得到 **$w_3$ 的梯度**：


$$\frac{\partial L}{\partial w_3} = \delta_2 \cdot h_1 = -0.116 \cdot 0.475 \approx -0.0551$$

同理，**$b_2$ 的梯度**（因为 $\frac{\partial z_2}{\partial b_2} = 1$）：


$$\frac{\partial L}{\partial b_2} = \delta_2 \cdot 1 = -0.116$$


### 2. 隐藏层到输入层的梯度（计算 $\frac{\partial L}{\partial w_1}$、$\frac{\partial L}{\partial w_2}$ 和 $\frac{\partial L}{\partial b_1}$）

现在我们需要跨层往回传。以 $w_1$ 为例，链式法则展开为：


$$\frac{\partial L}{\partial w_1} = \frac{\partial L}{\partial h_1} \cdot \frac{\partial h_1}{\partial z_1} \cdot \frac{\partial z_1}{\partial w_1}$$

* **第一部分**（上层传回的误差）：$\frac{\partial L}{\partial h_1} = \delta_2 \cdot w_3 = -0.116 \cdot 0.7 = -0.0812$
* **第二部分**（隐藏层激活函数求导）：$\frac{\partial h_1}{\partial z_1} = h_1(1 - h_1) = 0.475 \cdot (1 - 0.475) \approx 0.249$
* **第三部分**：因为 $z_1 = x_1 w_1 + x_2 w_2 + b_1$，所以 $\frac{\partial z_1}{\partial w_1} = x_1 = 2.0$

同样，合并前两部分得到隐藏层的误差项 $\delta_1$：


$$\delta_1 = \frac{\partial L}{\partial z_1} = -0.0812 \cdot 0.249 \approx -0.0202$$

最终得到 **$w_1, w_2$ 和 $b_1$ 的梯度**：


$$\frac{\partial L}{\partial w_1} = \delta_1 \cdot x_1 = -0.0202 \cdot 2.0 = -0.0404$$

$$\frac{\partial L}{\partial w_2} = \delta_1 \cdot x_2 = -0.0202 \cdot 3.0 = -0.0606$$

$$\frac{\partial L}{\partial b_1} = \delta_1 = -0.0202$$

## 第四阶段：权重更新（Weight Update）

拿到了所有参数的梯度后，我们就可以利用梯度下降公式更新权重了：


$$\text{新参数} = \text{旧参数} - \eta \cdot \text{梯度}$$

* **更新 $w_3$**：$w_3^{(new)} = 0.7 - 0.1 \cdot (-0.0551) = 0.70551$
* **更新 $b_2$**：$b_2^{(new)} = -0.2 - 0.1 \cdot (-0.116) = -0.1884$
* **更新 $w_1$**：$w_1^{(new)} = 0.5 - 0.1 \cdot (-0.0404) = 0.50404$
* **更新 $w_2$**：$w_2^{(new)} = -0.4 - 0.1 \cdot (-0.0606) = -0.39394$
* **更新 $b_1$**：$b_1^{(new)} = 0.1 - 0.1 \cdot (-0.0202) = 0.10202$


## 更新前后对比

经过**这次**反向传播更新后，参数发生了如下变化：

| 参数 | 初始值 | 计算出的梯度 | 更新后的值 |
| --- | --- | --- | --- |
| $w_1$ | $0.5$ | $-0.0404$ | **$0.50404$** |
| $w_2$ | $-0.4$ | $-0.0606$ | **$-0.39394$** |
| $b_1$ | $0.1$ | $-0.0202$ | **$0.10202$** |
| $w_3$ | $0.7$ | $-0.0551$ | **$0.70551$** |
| $b_2$ | $-0.2$ | $-0.116$ | **$-0.1884$** |

---

### 两次迭代结果对比

现在用第一轮更新后的**全新参数**，重新进行一次正向传播，网络的预测结果和损失值发生以下变化：

| 关键指标 | 第一轮（初始参数） | 第二轮（更新后） | 变化趋势与意义 |
| --- | --- | --- | --- |
| **预测值 $y_{pred}$** | $0.533$ | **$0.538$** |  **变大**，更加贴近目标 |
| **总损失值 $L$** | $0.109$ | **$0.1067$** |  **变小**，网络整体的误差降低|

### 总结

这就是反向传播和梯度下降的神奇之处。仅仅经过**一次**参数更新，网络就自己把隐藏层和输出层的权重和偏置调整到了更合理的数值。如果让机器这样不断地“正向传播 $\rightarrow$ 计算损失 $\rightarrow$ 反向传播 $\rightarrow$ 更新参数”循环几百上千次，损失值就会无限逼近于 $0$，而预测值就会非常接近 $1.0$，神经网络也就这样“学会”了数据背后的规律。