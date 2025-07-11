# 图片资源文件夹

将景点图片文件放在此目录下，然后在 `data.json` 中更新相应的图片路径。

## 建议的图片规格

- **尺寸**: 400x300px 或保持 4:3 比例
- **格式**: JPG、PNG
- **文件大小**: 建议小于 500KB
- **命名规范**: 使用有意义的文件名，如 `gugong_01.jpg`

## 示例文件结构

```
assets/images/
├── beijing/
│   ├── gugong_01.jpg
│   ├── gugong_02.jpg
│   └── tiantan_01.jpg
├── zhejiang/
│   ├── xihu_01.jpg
│   └── lingyin_01.jpg
└── ...
```

## 使用方法

1. 将图片文件放入此目录
2. 在 `data.json` 中更新图片路径：
   ```json
   "images": [
     "assets/images/beijing/gugong_01.jpg",
     "assets/images/beijing/gugong_02.jpg"
   ]
   ```

注意：当前项目使用 Unsplash API 提供的示例图片，您可以替换为实际的景点图片。 