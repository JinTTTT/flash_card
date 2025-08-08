# Flash Card 英语学习

基于艾宾浩斯遗忘曲线的英语单词学习应用

## 功能

- **智能复习**：艾宾浩斯遗忘曲线算法，科学安排复习时间
- **Flash Card**：卡片式学习，即时反馈
- **CSV管理**：支持CSV文件批量导入导出
- **学习统计**：进度跟踪和统计分析

## 使用

1. 打开 `index.html`
2. 手动添加单词或导入CSV文件
3. 开始Flash Card复习

## CSV格式

```csv
ID,单词/短语,解释,例句,分类,添加时间
1,nail down,successfully complete,We need to nail down the details,动词短语,2024/8/8
```

## 架构

```
├── data/vocabulary.csv     # 词汇数据
├── js/
│   ├── core/              # 核心功能
│   ├── ui/                # 界面组件
│   └── app.js            # 主应用
├── css/                   # 样式文件
└── index.html            # 主页面
```

## 算法

艾宾浩斯复习间隔：1天→2天→4天→7天→15天→30天...
根据掌握程度自动调整间隔，连续5次正确标记为已掌握。