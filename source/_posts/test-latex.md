---
title: LaTeX 公式测试文章
date: 2026-03-24 10:00:00
tags:
categories:
published: true
updated: 2026-03-24T13:25:11.480Z
---
![](/test-latex/30a65fdd65c5bda43a0bd197c50a60be.jpg)
这是一篇用于测试 LaTeX 公式渲染的文章。

## 行内公式

爱因斯坦的质能方程 $E=mc^2$ 是物理学中最著名的公式之一。

## 块级公式

二次方程的求根公式：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

## 矩阵示例

$$
\begin{pmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{pmatrix}
$$

## 积分公式

$$
\int_{-\infty}^{+\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## 求和与极限

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

$$
\lim_{x \to 0} \frac{\sin x}{x} = 1
$$

## 代码块测试

```python
def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 打印前10个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

## 引用测试

> 数学是科学的皇后，数论是数学的皇后。——高斯

## 列表测试

### 无序列表
- 第一项
- 第二项
  - 子项 1
  - 子项 2
- 第三项

### 有序列表
1. 第一步
2. 第二步
3. 第三步

## 表格测试

| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 25   | 工程师 |
| 李四 | 30   | 设计师 |
| 王五 | 28   | 产品经理 |

---

**文章结束**
