<?php
// 自动更新版本号的PHP脚本
$version = date('YmdHis'); // 使用时间戳作为版本号

// 读取index.html文件
$indexContent = file_get_contents('index.html');

// 更新CSS版本号
$indexContent = preg_replace('/style\.css\?v=[\d\.]+/', "style.css?v=$version", $indexContent);

// 更新JS版本号
$indexContent = preg_replace('/script\.js\?v=[\d\.]+/', "script.js?v=$version", $indexContent);

// 写回文件
file_put_contents('index.html', $indexContent);

echo "版本号已更新为: $version\n";
echo "请刷新浏览器查看最新版本\n";
?> 