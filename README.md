Setup Instruction

Step 1:
  Create a 2 .env file
    1 in backend folder and 1 in frontend folder

Step 2:
  Paste this on backend .env file with your own credentials
  
  PORT=
  NODE_ENV=
  CLERK_PUBLISHABLE_KEY=
  CLERK_SECRET_KEY=
  DATABASE_URL=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
  CLOUDINARY_CLOUD_NAME=
  SUPABASE_URL=
  SUPABASE_SERVICE_ROLE_KEY=
  SUPABASE_BUCKET=
  API_BASE_URL=
  
Paste this on frontend .env file with your own credentials

VITE_CLERK_PUBLISHABLE_KEY=

Step 3: 
  From the root folder:
    cd backend
    npm install
    npx prisma generate
    npm run dev
Step 4:
  Open New Terminal
    cd frontend
    npm install
    npm run dev

  This will appear: http://localhost:5173/
  CTR + click to navigate
  
(Make sure you have separate terminal open for backend and frontend)




    
