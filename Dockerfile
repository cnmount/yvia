# 1. 使用官方 Node.js 20 Alpine 镜像作为基础镜像
FROM node:20-alpine

# 2. 设置工作目录（容器内的目录）
WORKDIR /app

# 3. 先复制 package.json 和 package-lock.json（如果有）
#    这样 npm install 可以充分利用 Docker 缓存
COPY package.json package-lock.json* ./

# 4. 安装项目依赖（包括 typescript 等）
RUN npm install

# 5. 复制项目全部源代码到 /app
COPY . .

# 6. 全局安装 typescript（可选，如果项目里已经有 typescript 也可以不装）
RUN npm install -g typescript

# 7. 默认命令：进入容器后先执行 npm run build
#    但我们会用 docker run 时覆盖它，所以这里可以写个简单的 shell
CMD ["sh"]