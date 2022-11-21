const setNginxScript = (
  buildType: string,
  CUSTOM_DOMAIN: string,
  REPO_NAME: string,
) => {
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

        proxy_set_header    Host                \$host;
        proxy_set_header    X-Real-IP           \$remote_addr;
        proxy_set_header    X-Forwarded-For     \$proxy_add_x_forwarded_for;
    }
  }
    ' > default.conf`,
    ];

    return nginxScript;
  }
};

export default setNginxScript;
