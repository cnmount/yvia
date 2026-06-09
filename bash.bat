@echo off
chcp 65001 >nul
setlocal

echo [= Docker TSX/TS 编译脚本 =]
echo.

REM 1. 构建镜像
echo [1/4] Building Docker image...
docker build -t tsx-build-env .
if errorlevel 1 (
    echo.
    echo ERROR: Docker build failed.
    pause
    exit /b 1
)

echo.

REM 2. 运行容器并编译（不加 --rm，容器退出后保留）
echo [2/4] Running container and compiling...
docker run --name tsx-container tsx-build-env sh -c "npm install && npm run build"
if errorlevel 1 (
    echo.
    echo ERROR: Compilation failed inside container.
    echo You can inspect the container logs if needed.
    pause
    exit /b 1
)

echo.

REM 3. 把编译结果从容器复制回本地
echo [3/4] Copying build output from container to local...

REM 假设编译输出目录是 dist，如不同请修改
REM docker cp tsx-container:/app/dist ./dist-docker
docker cp tsx-container:/app/dist/. D:\project\yvia
if errorlevel 1 (
    echo.
    echo ERROR: Failed to copy dist from container.
    pause
    exit /b 1
)

echo.

REM 4. 删除容器
echo [4/4] Removing container...
docker rm tsx-container
if errorlevel 1 (
    echo.
    echo WARNING: Failed to remove container (may already be removed).
)

echo.
echo [= Build completed successfully. Output in: dist-docker =]

set "GIT=E:\Program Files\Git\cmd\git.exe"
if not exist "%GIT%" set "GIT=E:\Program Files\Git\cmd\git.exe"

echo ===== Git 提交 =====
set /p commitMsg=请输入 commit message:
"%GIT%" add .
"%GIT%" commit -m "%commitMsg%"
"%GIT%" push

echo ================================
echo 提交成功！Message: %commitMsg%
echo ================================

pause