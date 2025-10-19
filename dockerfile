# Stage 1: Build the React app using Node.js
FROM node:latest AS build


# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) for installing dependencies
COPY package*.json ./

# Install the frontend dependencies
RUN npm install

# Copy the rest of the React app code
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Use Nginx to serve the built React app
FROM nginx:alpine

# Copy the built React app from the previous stage to Nginx's default directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for Nginx (frontend)
EXPOSE 80

# Run Nginx to serve the app
CMD ["nginx", "-g", "daemon off;"]
