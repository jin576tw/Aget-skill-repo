---
name: build-deploy
description: Docker base-image 打包與部署流程，含 VirtualBox VM 環境設定、Harbor 推送、Jenkins Pipeline 說明
metadata:
  type: reference
---

# 包版（Base-Image 打包）與部署流程

> 來源：`P:\筆記\包版流程.txt`，適用 Core / PA / POS 等前端專案。

---

## 一、VM 環境設定（一次性）

1. VirtualBox 新增 Ubuntu VM — RAM 10248 MB、儲存 100 GB
2. 網路 → 連接埠轉送：主機 `127.0.0.1:22` → 客體 `10.0.2.15:22`
3. 安裝 MobaXterm，新增 session 連線 `127.0.0.1`
4. 啟用 root SSH 登入：
   ```bash
   sudo passwd root
   sudo vi /etc/ssh/sshd_config   # 設定 PermitRootLogin yes、PubkeyAuthentication yes
   su root
   ```
5. 安裝 Docker（官方流程：https://docs.docker.com/engine/install/ubuntu/）
6. 設定 insecure-registry：
   ```bash
   sudo nano /etc/docker/daemon.json
   # 內容：{ "insecure-registries": ["harbor.transglobe.com.tw"] }
   ```
7. 設定 DNS 解析：`vi /etc/hosts` → 加入 `10.67.68.168 harbor.com.tw`

---

## 二、打包 Base-Image（套件升級後必做）

> **重要**：前端套件（`package.json`）升級後，必須重新打包 Base-Image 並推送至 Harbor，正式區才能使用新套件。

1. VM 安裝 Node/npm：`sudo apt install -y nodejs npm`
2. `git clone` 專案，取得 `package.json`，執行 `npm install` 取得 `node_modules`
3. 建立 Dockerfile（第一階段：本地測試用）：
   ```dockerfile
   FROM harbor.transglobe.com.tw/sdc/node_common_lib_offline:0.0.1
   WORKDIR /app
   RUN rm -r -f node_modules
   RUN rm -r -f package.json
   RUN rm -f -f pnpm-lock.yaml
   COPY . .
   RUN rm -r -f Dockerfile
   ```
4. `docker build -t [base-image名稱]:0.0.1 .`
5. 本地測試：`docker run -d -p [主機埠]:80 --name [容器名] [image名]:0.0.1`
   - VirtualBox 追加連接埠轉送：主機 `127.0.0.1:[主機埠]` → 客體 `10.0.2.15:[主機埠]`
   - 瀏覽器確認可訪問後視為成功
6. 測試通過後，重建 Dockerfile 為正式版（含前端 build + nginx 部署）：
   ```dockerfile
   FROM [base-image名稱]:0.0.1 as build-stage
   WORKDIR /app
   COPY . .
   RUN npm run build
   # production stage
   FROM harbor.transglobe.com.tw/adp/nginx-unprivileged:stable-alpine as production-stage
   USER root
   RUN chmod -R 777 /usr/share/nginx/html
   COPY --from=build-stage /app/dist/browser /usr/share/nginx/html/[前端專案名稱]
   COPY default.conf /etc/nginx/conf.d/default.conf
   COPY entrypoint.sh /usr/share/nginx/html/[前端專案名稱]/
   ENV TZ='Asia/Taipei'
   ENV LANG=C.UTF-8
   RUN chmod +x /usr/share/nginx/html/[前端專案名稱]/entrypoint.sh
   ENTRYPOINT ["/usr/share/nginx/html/[前端專案名稱]/entrypoint.sh"]
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```
7. 推送至 Harbor：
   ```bash
   docker login harbor.transglobe.com.tw   # 需申請 Harbor 帳號
   docker push harbor.transglobe.com.tw/...
   ```

---

## 三、Jenkins Pipeline 部署

- Base-Image 推送完成後，Harbor 即有新版映像
- Jenkins Pipeline 指定該 Base-Image 版本進行建置，完成後部署至目標環境
- 套件更新時：更新 `package.json` → 重跑步驟二（記得更新 Dockerfile 版號）

---

## 四、常用指令速查

| 指令                        | 用途             |
| ------------------------- | -------------- |
| `docker ps -a`            | 查看所有 container |
| `docker images`           | 查看所有 image     |
| `docker rmi [image]`      | 移除 image       |
| `docker rm [container]`   | 移除 container   |
| `docker logs [container]` | 查看容器 log       |
| `docker image prune -a`   | 清空所有 image     |
| `docker login/logout`     | Harbor 登入/登出   |
|                           |                |

**Why:** 系統僅開放內網，套件無法從公網拉取，須預先打包進 Base-Image 才能讓 CI/CD 離線建置。
**How to apply:** 每次 `package.json` 有新增或升級套件，都需要走完步驟二再推送至 Harbor，正式區才會取用到新套件。
