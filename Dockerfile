FROM node:20-slim

WORKDIR /app

COPY package*.json ./

# TODO this could be improved - build first (using dev dependancies) then copy to new layer. or work out how to build using only prod deps
# Set NODE_ENV to production so npm skips devDependencies
# ENV NODE_ENV=production
# RUN npm install --only=production

RUN npm install 

COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "serve:prod"]
