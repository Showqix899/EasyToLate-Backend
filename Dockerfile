#base image 
FROM node:20-alpine


#creat app directory
WORKDIR /app


#copy package files first (for caching)
COPY package*.json ./


#install dependencies 
RUN npm install


#COPY project files 
COPY . .

#EXPOSE app port

EXPOSE 5000

#Default Command 
CMD ["npm","run","dev"]