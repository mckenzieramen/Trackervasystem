FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node package.json server.mjs ./
COPY --chown=node:node public ./public
RUN mkdir /data && chown node:node /data
ENV HOST=0.0.0.0 PORT=3000 DATA_DIR=/data
USER node
VOLUME ["/data"]
EXPOSE 3000
CMD ["node", "server.mjs"]
