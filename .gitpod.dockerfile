FROM gitpod/workspace-full

RUN sudo apt update \
 && sudo apt upgrade -y \
 && sudo apt install -y \
     libgtk-3-0 \
     libdrm2 \
     libgbm-dev


RUN npm install -g npm