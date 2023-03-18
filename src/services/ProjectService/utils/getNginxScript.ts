const getNginxScript = (
  buildType: string,
  CUSTOM_DOMAIN: string,
  REPO_NAME: string,
): string[] => {
  if (buildType.includes("SPA")) {
    const nginxScript = [
      `cd /etc/nginx/conf.d`,
      `echo '
  server {
    listen 80;
    listen [::]:80;

    server_name ${CUSTOM_DOMAIN};

    location / {
      root /home/ec2-user/jaamtoast/${REPO_NAME}/build;
      index index.html index.htm;
      try_files $uri $uri/ /index.html;
    }
  }
    ' > default.conf`,
    ];

    return nginxScript;
  } else {
    const nginxScript = [
      `cd /etc/nginx/conf.d`,
      `echo '
  server {
    listen 80;
    listen [::]:80;

    server_name ${CUSTOM_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version  1.1;

        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        send_timeout 600s;

        proxy_buffer_size          128k;
        proxy_buffers              8 256k;
        proxy_busy_buffers_size    256k;

        proxy_set_header    Host                \$host;
        proxy_set_header    X-Real-IP           \$remote_addr;
        proxy_set_header    X-Forwarded-For     \$proxy_add_x_forwarded_for;
    }

    location /socket.io/ {
      proxy_pass http://127.0.0.1:3000/socket.io/;
      proxy_http_version 1.1;

      proxy_connect_timeout 600s;
      proxy_send_timeout 600s;
      proxy_read_timeout 600s;
      send_timeout 600s;

      proxy_buffer_size          128k;
      proxy_buffers              8 256k;
      proxy_busy_buffers_size    256k;

      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "Upgrade";
      proxy_set_header Host \$host;
    }
  }
    ' > default.conf`,
    ];

    return nginxScript;
  }
};

export default getNginxScript;
