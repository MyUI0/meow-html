#!/bin/sh
# ============================================================
# Meow 博客 - 路由器部署脚本
# ============================================================
# 用法:
#   sh deploy.sh          → 自动部署
#   sh deploy.sh update   → 强制从 GitHub 更新
#
# 说明:
#   使用独立的 uhttpd 实例（端口8080）服务博客
#   访问地址: http://路由器IP:8080/
#   pio 看板娘资源 (~2MB) 存放在 /tmp (RAM)，节省闪存
# ============================================================

ZIP_URL="https://gh.llkk.cc/https://github.com/MyUI0/meow-html/archive/refs/heads/main.zip"
WWW_DIR="/www/meow"
PIO_DIR="/tmp/pio"
ZIP_FILE="/tmp/meow-html.zip"
REAL_DIR="/tmp/meow-html-main"

echo "========================================"
echo "  Meow 博客部署"
echo "========================================"

# ----- 检查是否需要下载 -----
NEED_DEPLOY=0

if [ "$1" = "update" ] || [ "$1" = "-u" ]; then
    echo "📝 更新模式..."
    NEED_DEPLOY=1
elif [ ! -f "$WWW_DIR/index.html" ]; then
    echo "📝 首次部署..."
    NEED_DEPLOY=1
else
    echo "✅ 已部署，无需更新"
    NEED_DEPLOY=0
fi

# 检查 /tmp/pio 是否存在（路由器重启后 /tmp 会清空）
if [ "$NEED_DEPLOY" != "1" ] && [ ! -d "$PIO_DIR" ]; then
    echo "⚠ 检测到看板娘资源丢失，重新恢复..."
    NEED_DEPLOY=1
fi

if [ "$NEED_DEPLOY" != "1" ]; then
    echo ""
    echo "如需更新: sh deploy.sh update"
    echo "访问地址: http://路由器IP:8080/"
    exit 0
fi

# ----- 下载 -----
echo ""
echo "1️⃣ 下载..."
rm -rf "$REAL_DIR" "$ZIP_FILE"
mkdir -p "$WWW_DIR"

wget --no-check-certificate "$ZIP_URL" -O "$ZIP_FILE"
if [ ! -f "$ZIP_FILE" ]; then
    echo "❌ 下载失败！"
    exit 1
fi
echo "   ✅ 下载完成 ($(du -h "$ZIP_FILE" | awk '{print $1}'))"

# ----- 解压 -----
echo ""
echo "2️⃣ 解压..."
unzip -o "$ZIP_FILE" -d /tmp > /dev/null 2>&1
if [ ! -d "$REAL_DIR" ]; then
    echo "❌ 解压失败！"
    rm -f "$ZIP_FILE"
    exit 1
fi
echo "   ✅ 解压完成"

# ----- 部署到 /www/meow -----
echo ""
echo "3️⃣ 部署文件..."

# 复制 content
cp -rf "$REAL_DIR/content" "$WWW_DIR/" 2>/dev/null && echo "   ✓ content/"

# 复制 assets，排除 pio（pio 放 /tmp 节省闪存）
mkdir -p "$WWW_DIR/assets"
for sub in css js svg images; do
    if [ -d "$REAL_DIR/assets/$sub" ]; then
        cp -rf "$REAL_DIR/assets/$sub" "$WWW_DIR/assets/" 2>/dev/null && echo "   ✓ assets/$sub/"
    fi
done

# pio 看板娘资源 → /tmp（RAM），软链接到 assets/pio
rm -rf "$PIO_DIR"
cp -rf "$REAL_DIR/assets/pio" "$PIO_DIR"
rm -rf "$WWW_DIR/assets/pio"
ln -s "$PIO_DIR" "$WWW_DIR/assets/pio"
echo "   ✓ assets/pio/ → /tmp/pio (RAM, ~2MB)"

# 复制HTML文件
for page in index post archive categories tags about 404 admin theme-editor preview; do
    if [ -f "$REAL_DIR/${page}.html" ]; then
        cp -f "$REAL_DIR/${page}.html" "$WWW_DIR/"
        echo "   ✓ ${page}.html"
    fi
done

chmod -R 755 "$WWW_DIR" "$PIO_DIR"

# ----- 清理 -----
rm -rf "$REAL_DIR" "$ZIP_FILE"

# ----- 配置 uhttpd 实例 -----
echo ""
echo "4️⃣ 配置 uhttpd..."

# 检查是否已配置
if uci -q get uhttpd.blog > /dev/null 2>&1; then
    echo "   ✅ uhttpd 实例已存在"
else
    echo "   创建 uhttpd 实例..."
    uci set uhttpd.blog=uhttpd
    uci set uhttpd.blog.listen_http='0.0.0.0:8080'
    uci set uhttpd.blog.home='/www/meow'
    uci set uhttpd.blog.index_page='index.html'
    uci commit uhttpd
    /etc/init.d/uhttpd restart
    echo "   ✅ uhttpd 实例已创建"
fi

# ----- 完成 -----
echo ""
echo "========================================"
echo "  ✅ 部署完成！"
echo "========================================"
echo ""
echo "📍 访问地址: http://路由器IP:8080/"
echo "   文章管理: http://路由器IP:8080/admin.html"
echo "   主题编辑: http://路由器IP:8080/theme-editor.html"
echo ""
echo "📁 文件分布:"
echo "   /www/meow/       → 页面 + 用户内容 (~300KB)"
echo "   /tmp/pio/        → 看板娘资源 (RAM, ~2MB)"
echo ""
