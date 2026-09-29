from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Added CORS import
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# 1. Load your secret keys from the .env file
load_dotenv()

app = FastAPI()

# Added CORS middleware right after app initialization
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins (essential for your React frontend)
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Connect to the Cloud Database
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@app.get("/")
def check_server():
    return {"message": "Campus-Ride Backend is running on Kali!"}

@app.get("/test-connection")
def get_landmarks():
    # 3. Try to fetch data from your 'landmarks' table
    try:
        # Note: If your .env variables are missing, this will trigger the exception below
        response = supabase.table("landmarks").select("*").execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}