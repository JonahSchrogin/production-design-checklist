FROM registry.redhat.io/ubi9/ubi-minimal:latest

# Install minimal nginx web server
RUN microdnf install -y nginx && \
    microdnf clean all && \
    rm -rf /var/cache/yum

# Copy static web assets
COPY . /usr/share/nginx/html/

# Copy default entrypoint
RUN cp /usr/share/nginx/html/production-design-qa-checklist.html /usr/share/nginx/html/index.html || true

# Set permissions for non-root execution
RUN chown -R 1001:0 /usr/share/nginx/html /var/log/nginx /var/lib/nginx /run && \
    chmod -R g+rwX /usr/share/nginx/html /var/log/nginx /var/lib/nginx /run

EXPOSE 8080

USER 1001

CMD ["nginx", "-g", "daemon off;"]
