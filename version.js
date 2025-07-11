// 版本配置文件
const VERSION = {
    js: '1.0.1',
    css: '1.0.1',
    data: '1.0.0'
};

// 自动添加版本号的函数
function loadVersionedScript(src, version) {
    const script = document.createElement('script');
    script.src = `${src}?v=${version}`;
    document.head.appendChild(script);
}

function loadVersionedCSS(href, version) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${href}?v=${version}`;
    document.head.appendChild(link);
} 